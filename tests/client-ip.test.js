import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveClientIp, trustProxyEnabled } from '../src/lib/http/client-ip.js'

function headers(map) {
  return {
    get(name) {
      return map[name.toLowerCase()] ?? null
    },
  }
}

test('resolveClientIp ignores forwarded headers when TRUST_PROXY is off', () => {
  const previous = process.env.TRUST_PROXY
  delete process.env.TRUST_PROXY
  try {
    assert.equal(trustProxyEnabled(), false)
    assert.equal(
      resolveClientIp(headers({ 'x-forwarded-for': '203.0.113.10', 'x-real-ip': '203.0.113.11' })),
      'unknown',
    )
  } finally {
    if (previous === undefined) delete process.env.TRUST_PROXY
    else process.env.TRUST_PROXY = previous
  }
})

test('resolveClientIp trusts the first X-Forwarded-For hop when TRUST_PROXY is on', () => {
  const previous = process.env.TRUST_PROXY
  process.env.TRUST_PROXY = 'true'
  try {
    assert.equal(trustProxyEnabled(), true)
    assert.equal(
      resolveClientIp(headers({ 'x-forwarded-for': '203.0.113.10, 10.0.0.1' })),
      '203.0.113.10',
    )
    assert.equal(resolveClientIp(headers({ 'x-real-ip': '2001:db8::1' })), '2001:db8::1')
    assert.equal(resolveClientIp(headers({ 'x-forwarded-for': 'not an ip' })), 'unknown')
  } finally {
    if (previous === undefined) delete process.env.TRUST_PROXY
    else process.env.TRUST_PROXY = previous
  }
})
