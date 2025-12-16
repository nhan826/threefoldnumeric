const { URL } = require('url')
const http = require('http')
const https = require('https')

const base = process.env.CHECK_URL || process.env.SMOKE_URL || 'http://localhost:3000'
const url = new URL(base)

const lib = url.protocol === 'https:' ? https : http

const opts = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname || '/',
  method: 'GET',
  timeout: parseInt(process.env.CHECK_TIMEOUT_MS || '3000', 10)
}

const req = lib.request(opts, res => {
  console.log(`Checked ${base} -> ${res.statusCode} ${res.statusMessage || ''}`)
  process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 2)
})

req.on('error', err => {
  console.error(`Error checking ${base}:`, err.message)
  process.exit(3)
})

req.on('timeout', () => {
  console.error(`Timeout checking ${base}`)
  req.destroy()
  process.exit(4)
})

req.end()
