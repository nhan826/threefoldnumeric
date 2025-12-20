/**
 * SEN-SFP Helpers
 * Utility functions for axis scheduling, conversions, and manipulations
 */

const { Axis, Pole, TmpDigit, TmpMantissa, SenDigit, SenMantissa, Flags } = require('./types');

/**
 * Determine axis for a 1-indexed position
 */
function axisOfPosition(pos1) {
  const r = (pos1 - 1) % 3;
  if (r === 0) return Axis.X;
  if (r === 1) return Axis.Y;
  return Axis.Z;
}

/**
 * Convert SenMantissa to TmpMantissa
 */
function senToTmp(m) {
  const t = [];
  for (const d of m.digits) {
    const p = d.pole === Pole.POS ? +1 : -1;
    t.push(new TmpDigit(d.axis, p));
  }
  return new TmpMantissa(t);
}

/**
 * Convert TmpMantissa to SenMantissa, marking inexact if any TZERO encountered
 */
function tmpToSen(t, flags) {
  const m = [];
  for (const td of t.digits) {
    let pole;
    if (td.pole === 0) {
      flags.inexact = true;
      pole = Pole.NEG; // policy: TZERO -> NEG
    } else if (td.pole > 0) {
      pole = Pole.POS;
    } else {
      pole = Pole.NEG;
    }
    m.push(new SenDigit(td.axis, pole));
  }
  return new SenMantissa(m);
}

/**
 * Left-pad TmpMantissa with zeros to reach length L
 */
function leftPadZeros(t, L) {
  while (t.digits.length < L) {
    t.digits.unshift(new TmpDigit(axisOfPosition(1), 0));
  }
  return t;
}

/**
 * Right-shift TmpMantissa by k positions (prepend k zeros)
 */
function rightShiftTmp(t, k) {
  for (let i = 0; i < k; i++) {
    t.digits.unshift(new TmpDigit(axisOfPosition(1), 0));
  }
  return t;
}

/**
 * Canonicalize sign: if leading digit is negative, flip all poles and flip sign
 */
function normalizeSignTmp(t, sign) {
  if (t.digits.length === 0) return { tmp: t, sign };
  if (t.digits[0].pole < 0) {
    for (let i = 0; i < t.digits.length; i++) {
      t.digits[i].pole = -t.digits[i].pole;
    }
    sign = -sign;
  }
  return { tmp: t, sign };
}

/**
 * Negate all poles in TmpMantissa
 */
function negateTmp(t) {
  for (let i = 0; i < t.digits.length; i++) {
    t.digits[i].pole = -t.digits[i].pole;
  }
  return t;
}

/**
 * Clone a SEN_SFP number
 */
function cloneSfp(x) {
  const digitsClone = x.mant.digits.map(d => new SenDigit(d.axis, d.pole));
  const mantClone = new SenMantissa(digitsClone);
  const flagsClone = new Flags({
    inexact: x.flags.inexact,
    underflow: x.flags.underflow,
    overflow: x.flags.overflow,
    rounded: x.flags.rounded,
    subnormal: x.flags.subnormal,
    invalid: x.flags.invalid
  });
  const { SEN_SFP } = require('./types');
  return new SEN_SFP(x.special, x.sign, x.scale, mantClone, flagsClone);
}

/**
 * Create a small preview of a SEN_SFP for tracing
 */
function preview(x) {
  return {
    special: x.special,
    sign: x.sign,
    scale: x.scale,
    mant_len: x.mant.digits.length,
    flags: {
      inexact: x.flags.inexact,
      overflow: x.flags.overflow,
      underflow: x.flags.underflow,
      rounded: x.flags.rounded,
      subnormal: x.flags.subnormal,
      invalid: x.flags.invalid
    }
  };
}

module.exports = {
  axisOfPosition,
  senToTmp,
  tmpToSen,
  leftPadZeros,
  rightShiftTmp,
  normalizeSignTmp,
  negateTmp,
  cloneSfp,
  preview
};
