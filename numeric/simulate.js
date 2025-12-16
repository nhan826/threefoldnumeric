// --- Threefold SEN Backend Stub ---
// Replace the logic in this function with your proprietary SEN algorithm.
export function createSENBackend(name, exponentBits, mantissaBits, rounding = 'nearest', accumulation = 'same', seed = null) {
  // You can use a custom RNG or logic here
  const rng = (seed != null) ? mulberry32(Number(seed)) : Math.random

  return {
    name,
    exponentBits,
    mantissaBits,
    rounding,
    accumulation,
    seed: seed == null ? null : Number(seed),
    quantize(x) {
      // TODO: Replace with SEN quantization logic
      return quantizeFloatLike(x, exponentBits, mantissaBits, rounding, rng)
    },
    multiply(a, b) {
      // TODO: Replace with SEN multiply logic
      const p = a * b
      return quantizeFloatLike(p, exponentBits, mantissaBits, rounding, rng)
    },
    accumulate(sum, value) {
      // TODO: Replace with SEN accumulation logic
      if (accumulation === 'widened') return sum + value
      return quantizeFloatLike(sum + value, exponentBits, mantissaBits, rounding, rng)
    }
  }
}
// Simple FP-like quantizer for demo purposes.
// This is not IEEE-complete but good enough for visualizing relative error behavior.

// Simple helper: seedable PRNG (mulberry32)
function mulberry32(seed) {
  let t = seed >>> 0
  return function() {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ t >>> 15, 1 | t)
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r)
    return ((r ^ r >>> 14) >>> 0) / 4294967296
  }
}

export function quantizeFloatLike(x, exponentBits, mantissaBits, rounding = 'nearest', rng = Math.random) {
  // Handle special values
  if (Number.isNaN(x)) return NaN
  if (!isFinite(x)) return x
  if (x === 0) return 0

  const sign = Math.sign(x) || 1
  const absx = Math.abs(x)

  // Exponent fields (simple IEEE-like approximation)
  const maxExpField = Math.pow(2, exponentBits) - 1
  const bias = Math.pow(2, exponentBits - 1) - 1
  const maxNormalExp = (maxExpField - 1) - bias
  const minNormalExp = 1 - bias

  // Compute exponent such that absx = m * 2^e, where m in [1, 2)
  const e = Math.floor(Math.log2(absx))
  let m = absx / Math.pow(2, e)

  // Overflow
  if (e > maxNormalExp) {
    return sign * Infinity
  }

  // Subnormal handling: if exponent smaller than min normal exponent, treat as subnormal
  if (e < minNormalExp) {
    // Smallest positive normal
    const minNormal = Math.pow(2, minNormalExp)
    // Use a step corresponding to the minimum representable subnormal step
    const subnormalStep = Math.pow(2, minNormalExp - mantissaBits)
    const q = Math.round(absx / subnormalStep) * subnormalStep
    return sign * q
  }

  // Quantize mantissa to given mantissaBits (fractional bits)
  const fracSteps = Math.pow(2, mantissaBits)
  const frac = m - 1 // in [0,1)
  let qFrac
  if (rounding === 'stochastic') {
    // Use provided rng (seedable) for stochastic rounding
    qFrac = (Math.floor(frac * fracSteps + rng())) / fracSteps
  } else {
    qFrac = Math.round(frac * fracSteps) / fracSteps
  }
  const qM = 1 + qFrac

  // Reconstruct
  const q = sign * qM * Math.pow(2, e)

  return q
}

// Compute absolute ULP spacing for a given magnitude x and numeric format
export function computeULPAbs(x, exponentBits, mantissaBits) {
  if (x === 0) return Math.pow(2, 1 - (Math.pow(2, exponentBits - 1) - 1) - mantissaBits)
  const absx = Math.abs(x)
  const maxExpField = Math.pow(2, exponentBits) - 1
  const bias = Math.pow(2, exponentBits - 1) - 1
  const maxNormalExp = (maxExpField - 1) - bias
  const minNormalExp = 1 - bias

  const e = Math.floor(Math.log2(absx))
  if (e > maxNormalExp) {
    return Infinity
  }
  if (e < minNormalExp) {
    // subnormal spacing: 2^(minNormalExp - mantissaBits)
    return Math.pow(2, minNormalExp - mantissaBits)
  }
  return Math.pow(2, e - mantissaBits)
}

export function computeRelULP(x, exponentBits, mantissaBits) {
  if (x === 0) return Infinity
  const absx = Math.abs(x)
  const ulp = computeULPAbs(absx, exponentBits, mantissaBits)
  return ulp / absx
}

export function createBackend(name, exponentBits, mantissaBits, rounding = 'nearest', accumulation = 'same', seed = null) {
  // Create an RNG if seed is provided; otherwise use Math.random
  const rng = (seed != null) ? mulberry32(Number(seed)) : Math.random

  return {
    name,
    exponentBits,
    mantissaBits,
    rounding,
    accumulation,
    seed: seed == null ? null : Number(seed),
    quantize(x) {
      return quantizeFloatLike(x, exponentBits, mantissaBits, rounding, rng)
    },
    multiply(a, b) {
      const p = a * b
      return quantizeFloatLike(p, exponentBits, mantissaBits, rounding, rng)
    },
    accumulate(sum, value) {
      if (accumulation === 'widened') return sum + value
      return quantizeFloatLike(sum + value, exponentBits, mantissaBits, rounding, rng)
    }
  }
}
