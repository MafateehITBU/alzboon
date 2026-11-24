/** RFC4180-style CSV encode/decode for admin import/export. */

export function rowsToCsv(headers, rows) {
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvCell(row[header] ?? '')).join(','))
  }
  return `${lines.join('\n')}\n`
}

export function parseCsv(text) {
  const source = String(text || '').replace(/^\uFEFF/, '')
  const table = parseCsvTable(source)
  if (table.length === 0) return { headers: [], rows: [] }
  const headers = table[0].map((header) => String(header || '').trim())
  const rows = []
  for (let index = 1; index < table.length; index += 1) {
    const cells = table[index]
    if (cells.every((cell) => String(cell || '').trim() === '')) continue
    const row = {}
    for (let column = 0; column < headers.length; column += 1) {
      row[headers[column]] = cells[column] ?? ''
    }
    rows.push(row)
  }
  return { headers, rows }
}

export function csvResponse(filename, csvText) {
  return new Response(csvText, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

export function cellJson(value) {
  if (value == null) return ''
  return JSON.stringify(value)
}

export function readJsonCell(value, fallback) {
  const text = String(value ?? '').trim()
  if (!text) return fallback
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

export function readBoolCell(value, fallback = false) {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
  if (!text) return fallback
  if (['1', 'true', 'yes', 'y'].includes(text)) return true
  if (['0', 'false', 'no', 'n'].includes(text)) return false
  return fallback
}

function escapeCsvCell(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function parseCsvTable(text) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }
    if (char === ',') {
      row.push(cell)
      cell = ''
      continue
    }
    if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }
    if (char === '\r') continue
    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}
