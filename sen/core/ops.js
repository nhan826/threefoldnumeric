/**
 * SEN-SFP Core Arithmetic Operations
 * Add, Sub, Mul, Div with full tracing
 */

const { Special, Pole, SEN_SFP, SenMantissa, TmpMantissa, TmpDigit, Flags, TraceLevel, NullTracer } = require('./types');
const { senToTmp, tmpToSen, leftPadZeros, rightShiftTmp, normalizeSignTmp, negateTmp, axisOfPosition } = require('./helpers');
const { handleSpecialAdd, handleSpecialSub, handleSpecialMul, handleSpecialDiv } = require('./specials');
const { normalizePipeline } = require('./normalize');
const { preview } = require('./helpers');

/**
 * Align scales for add/sub operations
 */
function alignScales(a, b, cfg, tracer = new NullTracer()) {
  const common = Math.max(a.scale, b.scale);
  let ta = senToTmp(a.mant);
  let tb = senToTmp(b.mant);
  
  const shiftA = common - a.scale;
  const shiftB = common - b.scale;
  
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'ALIGN',
    message: 'Aligning scales',
    snapshot: { a_scale: a.scale, b_scale: b.scale, common, shiftA, shiftB }
  });
  
  ta = rightShiftTmp(ta, shiftA);
  tb = rightShiftTmp(tb, shiftB);
  
  return { ta, tb, common, sa: a.sign, sb: b.sign };
}

/**
 * Add two TmpMantissas
 */
function addTmpMantissas(a, b, tracer) {
  const L = Math.max(a.digits.length, b.digits.length);
  a = leftPadZeros(a, L);
  b = leftPadZeros(b, L);
  
  const s = [];
  for (let i = 0; i < L; i++) {
    s.push(new TmpDigit(a.digits[i].axis, a.digits[i].pole + b.digits[i].pole));
  }
  
  tracer.emit({
    level: TraceLevel.DEBUG,
    phase: 'ADD_RAW',
    message: 'Raw digitwise sum computed',
    snapshot: { len: L }
  });
  
  const { resolveCarriesFromInts } = require('./rounding');
  return resolveCarriesFromInts(new TmpMantissa(s), tracer);
}

/**
 * Add operation
 */
function add(a, b, cfg, tracer = new NullTracer()) {
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'OP',
    message: 'ADD start',
    snapshot: { a: preview(a), b: preview(b) }
  });
  
  const { handled, result } = handleSpecialAdd(a, b, tracer);
  if (handled) return result;
  
  const { ta, tb, common, sa, sb } = alignScales(a, b, cfg, tracer);
  
  if (sa === Pole.NEG) negateTmp(ta);
  if (sb === Pole.NEG) negateTmp(tb);
  
  const tmpSum = addTmpMantissas(ta, tb, tracer);
  
  const normalized = normalizePipeline(tmpSum, Pole.POS, common, cfg, tracer);
  return new SEN_SFP(normalized.special, normalized.sign, normalized.scale, normalized.mant, normalized.flags);
}

/**
 * Subtract operation
 */
function sub(a, b, cfg, tracer = new NullTracer()) {
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'OP',
    message: 'SUB start',
    snapshot: {}
  });
  
  const b2 = new SEN_SFP(b.special, -b.sign, b.scale, b.mant, b.flags);
  return add(a, b2, cfg, tracer);
}

/**
 * Multiply two TmpMantissas using convolution
 */
function mulTmpMantissas(a, b, tracer) {
  const La = a.digits.length;
  const Lb = b.digits.length;
  const L = La + Lb + 2;
  
  const acc = new Array(L).fill(0);
  const axes = [];
  for (let k = 0; k < L; k++) {
    axes.push(axisOfPosition(k + 1));
  }
  
  for (let i = 0; i < La; i++) {
    for (let j = 0; j < Lb; j++) {
      acc[i + j] += a.digits[i].pole * b.digits[j].pole;
    }
  }
  
  const t = [];
  for (let k = 0; k < L; k++) {
    t.push(new TmpDigit(axes[k], acc[k]));
  }
  
  tracer.emit({
    level: TraceLevel.DEBUG,
    phase: 'MUL_RAW',
    message: 'Convolution accumulated',
    snapshot: { L }
  });
  
  const { resolveCarriesFromInts } = require('./rounding');
  return resolveCarriesFromInts(new TmpMantissa(t), tracer);
}

/**
 * Multiply operation
 */
function mul(a, b, cfg, tracer = new NullTracer()) {
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'OP',
    message: 'MUL start',
    snapshot: { a: preview(a), b: preview(b) }
  });
  
  const { handled, result } = handleSpecialMul(a, b, tracer);
  if (handled) return result;
  
  const sign = a.sign * b.sign;
  let scale = a.scale + b.scale;
  
  const ta = senToTmp(a.mant);
  const tb = senToTmp(b.mant);
  const tmpProd = mulTmpMantissas(ta, tb, tracer);
  
  const normalized = normalizePipeline(tmpProd, sign, scale, cfg, tracer);
  return new SEN_SFP(normalized.special, normalized.sign, normalized.scale, normalized.mant, normalized.flags);
}

/**
 * Reciprocal of a TmpMantissa using Newton-Raphson
 */
function reciprocalMantissa(d, cfg, tracer) {
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'RECIP',
    message: 'Reciprocal start',
    snapshot: { P: cfg.P }
  });
  
  let flags = new Flags();
  
  // Initial guess: all +1 (policy)
  let x = [];
  for (let i = 1; i <= cfg.P; i++) {
    x.push(new TmpDigit(axisOfPosition(i), +1));
  }
  x = new TmpMantissa(x);
  
  // Newton-Raphson iterations
  const ITER = cfg.P <= 16 ? 2 : (cfg.P <= 32 ? 3 : 4);
  
  for (let it = 1; it <= ITER; it++) {
    tracer.emit({
      level: TraceLevel.INFO,
      phase: 'RECIP',
      message: 'Iteration',
      snapshot: { iter: it }
    });
    
    // dx = d * x
    let dx = mulTmpMantissas(d, x, tracer);
    const normalized1 = normalizePipeline(dx, Pole.POS, 0, cfg, tracer);
    flags = require('./normalize').mergeFlags(flags, normalized1.flags);
    
    // const Two = 2.0
    const twoDigits = [];
    for (let i = 1; i <= cfg.P; i++) {
      twoDigits.push(new TmpDigit(axisOfPosition(i), +1));
    }
    const twoMant = new SenMantissa(twoDigits.map(td => ({
      axis: td.axis,
      pole: td.pole > 0 ? Pole.POS : Pole.NEG
    })));
    const two = new SEN_SFP(Special.NORMAL, Pole.POS, 1, twoMant, new Flags());
    
    // e = 2 - dx
    const dxNum = new SEN_SFP(Special.NORMAL, Pole.POS, 0, normalized1.mant, new Flags());
    const e = sub(two, dxNum, cfg, tracer);
    
    // x_new = x * e
    let xe = mulTmpMantissas(x, senToTmp(e.mant), tracer);
    const normalized2 = normalizePipeline(xe, Pole.POS, 0, cfg, tracer);
    flags = require('./normalize').mergeFlags(flags, normalized2.flags);
    
    x = senToTmp(normalized2.mant);
  }
  
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'RECIP',
    message: 'Reciprocal done',
    snapshot: {}
  });
  
  return { mant: x, scaleAdjust: 0, flags };
}

/**
 * Divide operation
 */
function div(a, b, cfg, tracer = new NullTracer()) {
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'OP',
    message: 'DIV start',
    snapshot: { a: preview(a), b: preview(b) }
  });
  
  const { handled, result } = handleSpecialDiv(a, b, tracer);
  if (handled) return result;
  
  let sign = a.sign * b.sign;
  let scale = a.scale - b.scale;
  
  let d = senToTmp(b.mant);
  const { tmp: d2, sign: tmpS } = normalizeSignTmp(d, Pole.POS);
  d = d2;
  if (tmpS === Pole.NEG) sign = -sign;
  
  const inv = reciprocalMantissa(d, cfg, tracer);
  scale += inv.scaleAdjust;
  
  const ta = senToTmp(a.mant);
  const tmpQ = mulTmpMantissas(ta, inv.mant, tracer);
  
  const normalized = normalizePipeline(tmpQ, sign, scale, cfg, tracer);
  const f = require('./normalize').mergeFlags(normalized.flags, inv.flags);
  
  return new SEN_SFP(normalized.special, normalized.sign, normalized.scale, normalized.mant, f);
}

module.exports = {
  alignScales,
  addTmpMantissas,
  add,
  sub,
  mulTmpMantissas,
  mul,
  reciprocalMantissa,
  div
};
