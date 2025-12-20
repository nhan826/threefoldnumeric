/**
 * Rounding and Normalization Pipeline
 */

import {
  RoundMode,
  Pole,
  SfpConfig,
  SEN_SFP,
  Tracer,
  NullTracer,
  Flags,
  TmpMantissa,
  SenMantissa,
  Special,
} from "./types";
import {
  stripLeadingZeros,
  cloneFlags,
  makeZeroFlags,
  tmpToSen,
  normalizeSignTmp,
  countLeadingZeros,
} from "./helpers";
import {
  makeZero,
  makeInf,
  isZero,
} from "./specials";

/**
 * Normalize pole with balanced carry
 * -3 -> (0, -1), -2 -> (+1, -1), -1 -> (-1, 0), 0 -> (0, 0),
 * 1 -> (+1, 0), 2 -> (-1, +1), 3 -> (0, +1)
 */
export function normalizePoleWithCarry(v: number): { digit: number; carry: number } {
  if (v === 3) return { digit: 0, carry: 1 };
  if (v === 2) return { digit: -1, carry: 1 };
  if (v === 1) return { digit: 1, carry: 0 };
  if (v === 0) return { digit: 0, carry: 0 };
  if (v === -1) return { digit: -1, carry: 0 };
  if (v === -2) return { digit: 1, carry: -1 };
  if (v === -3) return { digit: 0, carry: -1 };

  // Recursive case for larger values
  let carry = 0;
  let remaining = v;
  while (remaining > 3) {
    remaining -= 2;
    carry += 1;
  }
  while (remaining < -3) {
    remaining += 2;
    carry -= 1;
  }
  const { digit: d, carry: c } = normalizePoleWithCarry(remaining);
  return { digit: d, carry: c + carry };
}

/**
 * Resolve carries from integer pole values
 */
export function resolveCarriesFromInts(
  sum: TmpMantissa,
  tracer: Tracer = new NullTracer()
): TmpMantissa {
  const digits = [...sum.digits];
  let carry = 0;

  for (let i = digits.length - 1; i >= 0; i--) {
    const v = digits[i].pole + carry;
    const { digit, carry: newCarry } = normalizePoleWithCarry(v);
    digits[i].pole = digit;
    carry = newCarry;
  }

  if (carry !== 0) {
    digits.unshift({
      axis: digits[0].axis,
      pole: carry > 0 ? 1 : -1,
    });
  }

  tracer.emit({
    level: "DEBUG",
    phase: "CARRY",
    message: "Carries resolved",
    snapshot: { final_carry: carry, len: digits.length },
  });

  return { digits };
}

/**
 * Determine if a pole has even parity
 * Policy: even if pole != +1
 */
export function isEvenParity(pole: number): boolean {
  return pole !== 1;
}

/**
 * Increment a pole with carry (used in rounding)
 * -1 -> 0 (no carry)
 *  0 -> +1 (no carry)
 * +1 -> -1 (carry)
 */
export function incPoleWithCarry(pole: number): { newPole: number; carry: boolean } {
  if (pole === 0) return { newPole: 1, carry: false };
  if (pole === -1) return { newPole: 0, carry: false };
  return { newPole: -1, carry: true };
}

/**
 * Increment TmpMantissa (for rounding up)
 */
export function incrementTmpDigits(
  kept: TmpMantissa
): { tmp: TmpMantissa; carryOut: boolean } {
  const digits = [...kept.digits];
  let carry = true;
  let i = digits.length - 1;

  while (i >= 0 && carry) {
    const { newPole, carry: newCarry } = incPoleWithCarry(digits[i].pole);
    digits[i].pole = newPole;
    carry = newCarry;
    i--;
  }

  return { tmp: { digits }, carryOut: carry };
}

/**
 * Deterministic stochastic rounding decision
 */
export function deterministicStochasticDecision(
  tail: TmpMantissa,
  seed: number
): boolean {
  // Simple FNV-like hash for determinism
  let h = seed >>> 0;
  for (const d of tail.digits) {
    h = ((h * 33) ^ (d.pole + 128)) >>> 0;
  }
  // Treat tail magnitude as probability threshold
  const tailMagnitude = tail.digits.reduce((sum, d) => sum + Math.abs(d.pole), 0);
  return (h % 256) < (tailMagnitude * 256) / tail.digits.length;
}

/**
 * Round TmpMantissa to precision P
 * Returns (rounded mantissa, flags, scale adjustment)
 */
export function roundToPrecision(
  tmp: TmpMantissa,
  sign: Pole,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): { tmp: TmpMantissa; flags: Flags; scaleAdjust: number } {
  const flags = makeZeroFlags();
  let scaleAdjust = 0;

  const digits = [...tmp.digits];

  // Pad to at least P digits
  while (digits.length < cfg.P) {
    digits.push({ axis: digits[digits.length - 1]?.axis || undefined as any, pole: 0 });
  }

  const kept = digits.slice(0, cfg.P);
  const tail = digits.slice(cfg.P);

  if (tail.length === 0) {
    tracer.emit({
      level: "DEBUG",
      phase: "ROUND",
      message: "No rounding needed",
      snapshot: { P: cfg.P },
    });
    return { tmp: { digits: kept }, flags, scaleAdjust };
  }

  const guard = tail[0].pole;
  const sticky = tail.some((d) => d.pole !== 0);

  flags.inexact = guard !== 0 || sticky;

  let inc = false;

  switch (cfg.ROUND_MODE) {
    case RoundMode.TOWARD_ZERO:
      inc = false;
      break;

    case RoundMode.UP:
      inc = sign === Pole.POS && (guard !== 0 || sticky);
      break;

    case RoundMode.DOWN:
      inc = sign === Pole.NEG && (guard !== 0 || sticky);
      break;

    case RoundMode.NEAREST_EVEN: {
      const tie = guard !== 0 && !sticky;
      if (tie) {
        inc = !isEvenParity(kept[cfg.P - 1]?.pole ?? 0);
      } else {
        inc = guard > 0 || sticky;
      }
      break;
    }

    case RoundMode.STOCHASTIC:
      inc = deterministicStochasticDecision({ digits: tail }, cfg.STOCH_SEED);
      break;
  }

  tracer.emit({
    level: "DEBUG",
    phase: "ROUND",
    message: "Rounding decision",
    snapshot: {
      guard,
      sticky,
      inc,
      mode: cfg.ROUND_MODE,
    },
  });

  if (inc) {
    flags.rounded = true;
    const { tmp: incremented, carryOut } = incrementTmpDigits({ digits: kept });
    const newKept = incremented.digits;

    if (carryOut) {
      newKept.unshift({ axis: newKept[0].axis, pole: 1 });
      scaleAdjust = 1;
      return { tmp: { digits: newKept.slice(0, cfg.P) }, flags, scaleAdjust };
    }

    return { tmp: incremented, flags, scaleAdjust };
  }

  return { tmp: { digits: kept }, flags, scaleAdjust };
}

/**
 * Merge two flag sets (OR operation)
 */
export function mergeFlags(a: Flags, b: Flags): Flags {
  return {
    inexact: a.inexact || b.inexact,
    underflow: a.underflow || b.underflow,
    overflow: a.overflow || b.overflow,
    rounded: a.rounded || b.rounded,
    subnormal: a.subnormal || b.subnormal,
    invalid: a.invalid || b.invalid,
  };
}

/**
 * Finalize: handle overflow/underflow/subnormal
 */
export function finalize(
  sign: Pole,
  scale: number,
  mant: SenMantissa,
  flags: Flags,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): { special: Special; sign: Pole; scale: number; mant: SenMantissa; flags: Flags } {
  // Overflow
  if (scale > cfg.E_MAX) {
    flags.overflow = true;
    tracer.emit({
      level: "INFO",
      phase: "FINALIZE",
      message: "Overflow -> INF",
      snapshot: { scale, E_MAX: cfg.E_MAX },
    });
    return { special: Special.INF, sign, scale: 0, mant: { digits: [] }, flags };
  }

  // Underflow
  if (scale < cfg.E_MIN) {
    if (!cfg.SUBNORMAL) {
      flags.underflow = true;
      tracer.emit({
        level: "INFO",
        phase: "FINALIZE",
        message: "Underflow -> ZERO (no subnormals)",
        snapshot: { scale, E_MIN: cfg.E_MIN },
      });
      return { special: Special.ZERO, sign, scale: 0, mant: { digits: [] }, flags };
    }

    // Subnormal path would be handled in normalizePipeline
    // For now, just mark as subnormal
    flags.subnormal = true;
  }

  return { special: Special.NORMAL, sign, scale, mant, flags };
}

/**
 * Complete normalization pipeline
 */
export function normalizePipeline(
  tmp: TmpMantissa,
  sign: Pole,
  scale: number,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): { special: Special; sign: Pole; scale: number; mant: SenMantissa; flags: Flags } {
  const flags = makeZeroFlags();

  tracer.emit({
    level: "INFO",
    phase: "NORMALIZE",
    message: "Start normalization",
    snapshot: { scale_in: scale, len_in: tmp.digits.length },
  });

  // Strip leading zeros
  const leadingZeros = countLeadingZeros(tmp);
  const stripped = stripLeadingZeros(tmp);

  if (stripped.digits.length === 0) {
    tracer.emit({
      level: "INFO",
      phase: "NORMALIZE",
      message: "All digits canceled -> ZERO",
      snapshot: {},
    });
    return { special: Special.ZERO, sign: Pole.POS, scale: 0, mant: { digits: [] }, flags };
  }

  scale -= leadingZeros;
  tracer.emit({
    level: "DEBUG",
    phase: "NORMALIZE",
    message: "Leading zeros stripped",
    snapshot: { stripped: leadingZeros, scale_now: scale, len: stripped.digits.length },
  });

  // Round to precision
  const { tmp: rounded, flags: roundFlags, scaleAdjust } = roundToPrecision(stripped, sign, cfg, tracer);
  const mergedFlags = mergeFlags(flags, roundFlags);
  scale += scaleAdjust;

  // Normalize sign
  const { tmp: signNormalized, sign: normalizedSign } = normalizeSignTmp(rounded, sign);
  tracer.emit({
    level: "DEBUG",
    phase: "NORMALIZE",
    message: "Sign canonicalized",
    snapshot: { sign: normalizedSign, scale },
  });

  // Convert to SEN
  const mant = tmpToSen(signNormalized, mergedFlags);

  // Finalize
  const { special, sign: finalSign, scale: finalScale, mant: finalMant, flags: finalFlags } = finalize(
    normalizedSign,
    scale,
    mant,
    mergedFlags,
    cfg,
    tracer
  );

  tracer.emit({
    level: "INFO",
    phase: "FINALIZE",
    message: "Normalization complete",
    snapshot: { special, scale: finalScale, sign: finalSign, flags: finalFlags },
  });

  return { special, sign: finalSign, scale: finalScale, mant: finalMant, flags: finalFlags };
}
