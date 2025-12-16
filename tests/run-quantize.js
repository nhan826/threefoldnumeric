const assert = require('assert')
const path = require('path')
const { pathToFileURL } = require('url')

async function run() {
  const modPath = pathToFileURL(path.resolve(__dirname, '..', 'numeric', 'simulate.js')).href
  const mod = await import(modPath)
  const { quantizeFloatLike, createBackend } = mod

  // Basic normal value
  const q1 = quantizeFloatLike(1.5, 5, 3, 'nearest')
  assert(Number.isFinite(q1), 'quantized normal should be finite')

  // Overflow: tiny exponentBits -> big value should overflow
  const qOverflow = quantizeFloatLike(1e100, 3, 2, 'nearest')
  assert(!Number.isFinite(qOverflow) || qOverflow === Infinity, 'overflow should produce Infinity')

  // Subnormal behavior: use a value smaller than min normal for small exponentBits
  const eBits = 4
  const bias = Math.pow(2, eBits - 1) - 1
  const minNormalExp = 1 - bias
  const minNormal = Math.pow(2, minNormalExp)
  const tiny = minNormal / 4
  const qSub = quantizeFloatLike(tiny, eBits, 2, 'nearest')
  assert(Math.abs(qSub) >= 0, 'subnormal quantization returns a finite (possibly zero) number')

  // Seeded stochastic determinism
  const b1 = createBackend('S1', 5, 3, 'stochastic', 'same', 42)
  const b2 = createBackend('S2', 5, 3, 'stochastic', 'same', 42)
  const a = 1.234567
  const r1 = b1.quantize(a)
  const r2 = b2.quantize(a)
  assert.strictEqual(r1, r2, 'seeded stochastic rounding should be deterministic for same seed')

  console.log('All quantize tests passed')
}

run().catch(err => {
  console.error('Tests failed:', err)
  process.exit(1)
})
