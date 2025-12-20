/**
 * SEN-SFP Arithmetic Operations
 * Add, Sub, Mul, Div, and supporting functions
 */

import {
  SEN_SFP,
  TmpMantissa,
  SfpConfig,
  Tracer,
  NullTracer,
  Pole,
  Special,
} from "./types";
import {
  senToTmp,
  negateTmp,
  normalizeSignTmp,
  leftPadZeros,
  rightShiftTmp,
  axisOfPosition,
  cloneSfp,
  createTmpAllPos,
} from "./helpers";
import {
  handleSpecialAdd,
  handleSpecialSub,
  handleSpecialMul,
  handleSpecialDiv,
  makeZero,
  makeInf,
  makeNaN,
} from "./specials";
import { resolveCarriesFromInts, normalizePipeline } from "./normalize";
import { preview } from "./helpers";

/**
 * Align scales for add/sub operations
 */
export function alignScales(
  a: SEN_SFP,
  b: SEN_SFP,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): {
  ta: TmpMantissa;
  tb: TmpMantissa;
  common: number;
  sa: Pole;
  sb: Pole;
} {
  const common = Math.max(a.scale, b.scale);
  let ta = senToTmp(a.mant);
  let tb = senToTmp(b.mant);

  const shiftA = common - a.scale;
  const shiftB = common - b.scale;

  tracer.emit({
    level: "INFO",
    phase: "ALIGN",
    message: "Aligning scales",
    snapshot: {
      a_scale: a.scale,
      b_scale: b.scale,
      common,
      shiftA,
      shiftB,
    },
  });

  ta = rightShiftTmp(ta, shiftA);
  tb = rightShiftTmp(tb, shiftB);

  return { ta, tb, common, sa: a.sign, sb: b.sign };
}

/**
 * Add two temporary mantissas (after alignment)
 */
export function addTmpMantissas(
  a: TmpMantissa,
  b: TmpMantissa,
  tracer: Tracer = new NullTracer()
): TmpMantissa {
  const L = Math.max(a.digits.length, b.digits.length);
  const padA = leftPadZeros(a, L);
  const padB = leftPadZeros(b, L);

  const sum = [];
  for (let i = 0; i < L; i++) {
    sum.push({
      axis: padA.digits[i].axis,
      pole: padA.digits[i].pole + padB.digits[i].pole,
    });
  }

  tracer.emit({
    level: "DEBUG",
    phase: "ADD_RAW",
    message: "Raw digitwise sum computed",
    snapshot: { len: L },
  });

  return resolveCarriesFromInts({ digits: sum }, tracer);
}

/**
 * Multiply two temporary mantissas using convolution
 */
export function mulTmpMantissas(
  a: TmpMantissa,
  b: TmpMantissa,
  tracer: Tracer = new NullTracer()
): TmpMantissa {
  const La = a.digits.length;
  const Lb = b.digits.length;
  const L = La + Lb + 2;

  // Accumulate products
  const acc: number[] = Array(L).fill(0);

  for (let i = 0; i < La; i++) {
    for (let j = 0; j < Lb; j++) {
      acc[i + j] += a.digits[i].pole * b.digits[j].pole;
    }
  }

  // Create temporary mantissa with accumulated values
  const digits = [];
  for (let k = 0; k < L; k++) {
    digits.push({
      axis: axisOfPosition(k + 1),
      pole: acc[k],
    });
  }

  tracer.emit({
    level: "DEBUG",
    phase: "MUL_RAW",
    message: "Convolution accumulated",
    snapshot: { L },
  });

  return resolveCarriesFromInts({ digits }, tracer);
}

/**
 * Compute reciprocal of mantissa using Newton-Raphson iteration
 */
export function reciprocalMantissa(
  d: TmpMantissa,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): { mant: TmpMantissa; scaleAdjust: number; flags: any } {
  tracer.emit({
    level: "INFO",
    phase: "RECIP",
    message: "Reciprocal start",
    snapshot: { P: cfg.P },
  });

  const flags = { inexact: false, overflow: false, underflow: false, rounded: false, invalid: false, subnormal: false };

  // Initial guess: 1.0 (all +1 digits)
  let x = createTmpAllPos(cfg.P);

  const iterations = cfg.P <= 16 ? 2 : cfg.P <= 32 ? 3 : 4;

  for (let it = 1; it <= iterations; it++) {
    tracer.emit({
      level: "DEBUG",
      phase: "RECIP",
      message: `Newton-Raphson iteration ${it}`,
      snapshot: { iter: it },
    });

    // dx = d * x
    const dx = mulTmpMantissas(d, x, tracer);

    // Normalize dx to get d*x as a number
    const { mant: dxMant } = normalizePipeline(dx, Pole.POS, 0, cfg, tracer);

    // Compute 2 - d*x
    const two = createTmpAllPos(cfg.P);
    const twoNum: SEN_SFP = {
      special: Special.NORMAL,
      sign: Pole.POS,
      scale: 1,
      mant: { digits: two.digits.map((d) => ({ ...d, pole: d.pole > 0 ? Pole.POS : Pole.NEG })) },
      flags: { inexact: false, overflow: false, underflow: false, rounded: false, invalid: false, subnormal: false },
    };

    const dxNum: SEN_SFP = {
      special: Special.NORMAL,
      sign: Pole.POS,
      scale: 0,
      mant: dxMant,
      flags: { inexact: false, overflow: false, underflow: false, rounded: false, invalid: false, subnormal: false },
    };

    // Create e = 2 - dx
    const eNumTmp = addTmpMantissas(senToTmp(twoNum.mant), negateTmp(senToTmp(dxNum.mant)), tracer);
    const eNum: SEN_SFP = {
      special: Special.NORMAL,
      sign: Pole.POS,
      scale: 1,
      mant: { digits: eNumTmp.digits.map((d) => ({ ...d, pole: d.pole > 0 ? Pole.POS : Pole.NEG })) },
      flags: { inexact: false, overflow: false, underflow: false, rounded: false, invalid: false, subnormal: false },
    };

    // x_new = x * e = x * (2 - d*x)
    const xe = mulTmpMantissas(x, senToTmp(eNum.mant), tracer);
    const { mant: xeMant } = normalizePipeline(xe, Pole.POS, 0, cfg, tracer);

    x = senToTmp(xeMant);
  }

  tracer.emit({
    level: "INFO",
    phase: "RECIP",
    message: "Reciprocal converged",
    snapshot: {},
  });

  return { mant: x, scaleAdjust: 0, flags };
}

/**
 * Addition: a + b
 */
export function add(
  a: SEN_SFP,
  b: SEN_SFP,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): SEN_SFP {
  tracer.emit({
    level: "INFO",
    phase: "OP",
    message: "ADD start",
    snapshot: { a: preview(a), b: preview(b) },
  });

  // Handle specials
  const { handled, result } = handleSpecialAdd(a, b, tracer);
  if (handled && result) {
    return result;
  }

  // Align scales
  let { ta, tb, common, sa, sb } = alignScales(a, b, cfg, tracer);

  // Apply signs
  if (sa === Pole.NEG) {
    ta = negateTmp(ta);
  }
  if (sb === Pole.NEG) {
    tb = negateTmp(tb);
  }

  // Add mantissas
  const tmpSum = addTmpMantissas(ta, tb, tracer);

  // Normalize
  const { special, sign, scale, mant, flags } = normalizePipeline(tmpSum, Pole.POS, common, cfg, tracer);

  return { special, sign, scale, mant, flags };
}

/**
 * Subtraction: a - b
 */
export function sub(
  a: SEN_SFP,
  b: SEN_SFP,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): SEN_SFP {
  tracer.emit({
    level: "INFO",
    phase: "OP",
    message: "SUB start",
    snapshot: { a: preview(a), b: preview(b) },
  });

  // Handle specials
  const { handled, result } = handleSpecialSub(a, b, tracer);
  if (handled && result) {
    return result;
  }

  // Negate b and use add
  const bNegated: SEN_SFP = {
    ...cloneSfp(b),
    sign: -b.sign as Pole,
  };

  return add(a, bNegated, cfg, tracer);
}

/**
 * Multiplication: a * b
 */
export function mul(
  a: SEN_SFP,
  b: SEN_SFP,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): SEN_SFP {
  tracer.emit({
    level: "INFO",
    phase: "OP",
    message: "MUL start",
    snapshot: { a: preview(a), b: preview(b) },
  });

  // Handle specials
  const { handled, result } = handleSpecialMul(a, b, tracer);
  if (handled && result) {
    return result;
  }

  const sign = (a.sign * b.sign) as Pole;
  let scale = a.scale + b.scale;

  const ta = senToTmp(a.mant);
  const tb = senToTmp(b.mant);

  const tmpProd = mulTmpMantissas(ta, tb, tracer);

  const { special, sign: resSign, scale: resScale, mant, flags } = normalizePipeline(tmpProd, sign, scale, cfg, tracer);

  return { special, sign: resSign, scale: resScale, mant, flags };
}

/**
 * Division: a / b
 */
export function div(
  a: SEN_SFP,
  b: SEN_SFP,
  cfg: SfpConfig,
  tracer: Tracer = new NullTracer()
): SEN_SFP {
  tracer.emit({
    level: "INFO",
    phase: "OP",
    message: "DIV start",
    snapshot: { a: preview(a), b: preview(b) },
  });

  // Handle specials
  const { handled, result } = handleSpecialDiv(a, b, tracer);
  if (handled && result) {
    return result;
  }

  const sign = (a.sign * b.sign) as Pole;
  let scale = a.scale - b.scale;

  // Normalize denominator sign
  let d = senToTmp(b.mant);
  const { tmp: dNormalized, sign: dSign } = normalizeSignTmp(d, Pole.POS);
  d = dNormalized;

  if (dSign === Pole.NEG) {
    // This shouldn't happen if b is canonical, but handle it
  }

  // Compute reciprocal
  const { mant: invMant, scaleAdjust } = reciprocalMantissa(d, cfg, tracer);
  scale += scaleAdjust;

  // Multiply a by reciprocal of b
  const ta = senToTmp(a.mant);
  const tmpQuot = mulTmpMantissas(ta, invMant, tracer);

  const { special, sign: resSign, scale: resScale, mant, flags } = normalizePipeline(tmpQuot, sign, scale, cfg, tracer);

  return { special, sign: resSign, scale: resScale, mant, flags };
}
