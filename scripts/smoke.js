// Simple smoke test: checks the landing page and /fundamentals for HTTP 200
const { setTimeout: setTimeoutPromise } = require('timers/promises')

const paths = ['/', '/fundamentals']
const base = process.env.SMOKE_URL || `http://localhost:${process.env.PORT || 3000}`
const timeoutMs = parseInt(process.env.SMOKE_TIMEOUT_MS || '5000', 10)

async function check(url) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

;(async () => {
  console.log(`Smoke test base: ${base}`)
  let allOk = true
  for (const p of paths) {
    const url = base.replace(/\/$/, '') + p
    process.stdout.write(`Checking ${url} ... `)
    const r = await check(url)
    if (r.ok) {
      console.log(`OK (${r.status})`)
    } else {
      console.log(`FAIL ${r.status || ''} ${r.error || ''}`)
      allOk = false
    }
    // small delay so servers that are just starting can breathe
    await setTimeoutPromise(200)
  }
  if (!allOk) {
    console.error('Smoke test failed')
    process.exit(2)
  }
  console.log('Smoke test passed')
  process.exit(0)
})()
