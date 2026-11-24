export function formatImportResult(label, result) {
  const parts = [
    `Imported ${label}: ${result.created} created, ${result.updated} updated`,
    result.total ? `(${result.total} rows)` : '',
  ].filter(Boolean)

  let message = parts.join(' ')
  if (result.warnings?.length) {
    message += `. ${result.warnings.length} row(s) imported without image(s) — upload images manually. ${result.warnings.slice(0, 3).join(' | ')}`
    if (result.warnings.length > 3) message += ` | +${result.warnings.length - 3} more`
  }
  if (result.errors?.length) {
    message += `. ${result.errors.length} row(s) failed. ${result.errors.slice(0, 5).join(' | ')}`
    if (result.errors.length > 5) message += ` | +${result.errors.length - 5} more`
  }
  return message
}
