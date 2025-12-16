const assert = require('assert')
const path = require('path')
const { pathToFileURL } = require('url')

async function run() {
  const modPath = pathToFileURL(path.resolve(__dirname, '..', 'numeric', 'simulate.js')).href
  const mod = await import(modPath)
  const { computeRelULP, computeULPAbs } = mod

  // For a normal value
  const rel1 = computeRelULP(1.5, 5, 3)
  assert(rel1 > 0 && rel1 < 1, 'rel ULP for normal should be reasonable')

  // For boundary near exponent change: x = 2^k
  const x = Math.pow(2, 10)
  const relBoundary = computeRelULP(x, 8, 23)
  // relative ulp should equal 2^-mantissa
  assert(Math.abs(relBoundary - Math.pow(2, -23)) < 1e-20, 'boundary ULP matches 2^-mantissa')

  // For subnormal region
  const eBits = 4
  const bias = Math.pow(2, eBits - 1) - 1
  const minNormalExp = 1 - bias
  const minNormal = Math.pow(2, minNormalExp)
  const tiny = minNormal / 8
  const absUlp = computeULPAbs(tiny, eBits, 2)
  assert(Number.isFinite(absUlp) && absUlp > 0, 'subnormal ULP absolute spacing is finite and >0')

  console.log('ULP tests passed')
}

run().catch(err => { console.error(err); process.exit(1) })
