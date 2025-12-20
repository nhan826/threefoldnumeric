/**
 * SEN-SFP Rounding
 * Implements all rounding modes and carry propagation
 */

const { RoundMode, TmpDigit, TmpMantissa, Flags, Pole, TraceLevel } = require('./types');
const { axisOfPosition } = require('./helpers');

/**
 * Balanced carry normalization for pole values
 * Maps intermediate pole sums to balanced (-1, 0, +1) form with carry
 */
function normalizePoleWithCarry(v) {
  if (v === 3) return { digit: 0, carry: +1 };
  if (v === 2) return { digit: -1, carry: +1 };
  if (v === 1) return { digit: +1, carry: 0 };
  if (v === 0) return { digit: 0, carry: 0 };
  if (v === -1) return { digit: -1, carry: 0 };
  if (v === -2) return { digit: +1, carry: -1 };
  if (v === -3) return { digit: 0, carry: -1 };
  
  // For larger values, recursively apply
  let carry = 0;
  while (v > 3) { v -= 2; carry += 1; }
  while (v < -3) { v += 2; carry -= 1; }
  const { digit: d, carry: c } = normalizePoleWithCarry(v);
  return { digit: d, carry: c + carry };
}

/**
 * Resolve carries from digit-wise sums
 */
function resolveCarriesFromInts(sum, tracer) {
  let carry = 0;
  for (let i = sum.digits.length - 1; i >= 0; i--) {
    const v = sum.digits[i].pole + carry;
    const { digit: d, carry: c } = normalizePoleWithCarry(v);
    sum.digits[i].pole = d;
    carry = c;
  }
  if (carry !== 0) {
    sum.digits.unshift(new TmpDigit(axisOfPosition(1), carry > 0 ? +1 : -1));
  }
  tracer.emit({
    level: TraceLevel.DEBUG,
    phase: 'CARRY',
    message: 'Carries resolved',
    snapshot: { final_carry: carry, len: sum.digits.length }
  });
  return sum;
}

/**
 * Check if pole value has even parity (policy: even if pole != +1)
 */
function isEvenParity(pole) {
  return pole !== +1;
}

/**
 * Increment a single pole digit with carry
 */
function incPoleWithCarry(pole) {
  if (pole === 0) return { newPole: +1, carry: false };
  if (pole === -1) return { newPole: 0, carry: false };
  return { newPole: -1, carry: true };
}

/**
 * Increment all kept digits for rounding up
 */
function incrementTmpDigits(kept) {
  let i = kept.length - 1;
  let carry = true;
  while (i >= 0 && carry) {
    const { newPole, carry: c } = incPoleWithCarry(kept[i].pole);
    kept[i].pole = newPole;
    carry = c;
    i--;
  }
  return { kept, carryOut: carry };
}

/**
 * Deterministic stochastic rounding decision
 * Must be deterministic based on seed and tail
 */
function deterministicStochasticDecision(tail, seed) {
  // Simple deterministic hash: use seed and tail pole values
  let h = seed >>> 0; // ensure unsigned 32-bit
  for (const d of tail) {
    h = ((h << 5) - h + d.pole) | 0; // simple hash mix
  }
  return ((h >>> 0) & 1) === 1;
}

/**
 * Round TmpMantissa to precision P according to rounding mode
 * Returns: { tmp: TmpMantissa, flags: Flags, scaleAdjust: int }
 */
function roundToPrecision(t, sign, cfg, tracer) {
  const flags = new Flags();
  let scaleAdjust = 0;
  
  // Pad to P if needed
  while (t.digits.length < cfg.P) {
    t.digits.push(new TmpDigit(axisOfPosition(t.digits.length + 1), 0));
  }
  
  const kept = t.digits.slice(0, cfg.P);
  const tail = t.digits.slice(cfg.P);
  
  if (tail.length === 0) {
    tracer.emit({
      level: TraceLevel.DEBUG,
      phase: 'ROUND',
      message: 'No rounding needed',
      snapshot: { P: cfg.P }
    });
    return { tmp: new TmpMantissa(kept), flags, scaleAdjust };
  }
  
  const guard = tail[0].pole;
  const sticky = tail.some(d => d.pole !== 0);
  
  if (guard !== 0 || sticky) {
    flags.inexact = true;
  }
  
  let inc = false;
  
  switch (cfg.ROUND_MODE) {
    case RoundMode.TOWARD_ZERO:
      inc = false;
      break;
    case RoundMode.UP:
      inc = (sign === Pole.POS) && ((guard !== 0) || sticky);
      break;
    case RoundMode.DOWN:
      inc = (sign === Pole.NEG) && ((guard !== 0) || sticky);
      break;
    case RoundMode.NEAREST_EVEN:
      const tie = (guard !== 0) && !sticky;
      if (tie) {
        inc = !isEvenParity(kept[cfg.P - 1].pole);
      } else {
        inc = (guard > 0) || sticky;
      }
      break;
    case RoundMode.STOCHASTIC:
      inc = deterministicStochasticDecision(tail, cfg.STOCH_SEED || 0);
      break;
  }
  
  tracer.emit({
    level: TraceLevel.DEBUG,
    phase: 'ROUND',
    message: 'Rounding decision',
    snapshot: { guard, sticky, inc, mode: cfg.ROUND_MODE }
  });
  
  if (inc) {
    flags.rounded = true;
    const { kept: keptNew, carryOut } = incrementTmpDigits(kept);
    if (carryOut) {
      keptNew.unshift(new TmpDigit(axisOfPosition(1), +1));
      keptNew.splice(cfg.P);
      scaleAdjust = +1;
    }
    return { tmp: new TmpMantissa(keptNew), flags, scaleAdjust };
  }
  
  return { tmp: new TmpMantissa(kept), flags, scaleAdjust };
}

module.exports = {
  normalizePoleWithCarry,
  resolveCarriesFromInts,
  isEvenParity,
  incPoleWithCarry,
  incrementTmpDigits,
  deterministicStochasticDecision,
  roundToPrecision
};
