/**
 * SEN-SFP Special Values
 * Handles NaN, Inf, Zero and special case arithmetic
 */

const { Special, Pole, SEN_SFP, SenMantissa, Flags, TraceLevel } = require('./types');

function makeZero(sign = Pole.POS) {
  return new SEN_SFP(Special.ZERO, sign, 0, new SenMantissa([]), new Flags());
}

function makeInf(sign = Pole.POS) {
  return new SEN_SFP(Special.INF, sign, 0, new SenMantissa([]), new Flags());
}

function makeNaN() {
  const f = new Flags();
  f.invalid = true;
  return new SEN_SFP(Special.NAN, Pole.POS, 0, new SenMantissa([]), f);
}

function handleSpecialAdd(a, b, tracer) {
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: 'NaN encountered', snapshot: {} });
    return { handled: true, result: makeNaN() };
  }
  
  if (a.special === Special.INF && b.special === Special.INF && a.sign !== b.sign) {
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: 'inf + (-inf) => NaN', snapshot: {} });
    return { handled: true, result: makeNaN() };
  }
  
  if (a.special === Special.INF) {
    return { handled: true, result: makeInf(a.sign) };
  }
  if (b.special === Special.INF) {
    return { handled: true, result: makeInf(b.sign) };
  }
  
  if (a.special === Special.ZERO) {
    return { handled: true, result: b };
  }
  if (b.special === Special.ZERO) {
    return { handled: true, result: a };
  }
  
  return { handled: false, result: null };
}

function handleSpecialSub(a, b, tracer) {
  // b is flipped sign, then use add rules
  return handleSpecialAdd(a, b, tracer);
}

function handleSpecialMul(a, b, tracer) {
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: 'NaN in mul', snapshot: {} });
    return { handled: true, result: makeNaN() };
  }
  
  if ((a.special === Special.ZERO && b.special === Special.INF) ||
      (a.special === Special.INF && b.special === Special.ZERO)) {
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: '0 * inf => NaN', snapshot: {} });
    return { handled: true, result: makeNaN() };
  }
  
  if (a.special === Special.INF || b.special === Special.INF) {
    const sign = a.sign * b.sign;
    return { handled: true, result: makeInf(sign) };
  }
  
  if (a.special === Special.ZERO || b.special === Special.ZERO) {
    const sign = a.sign * b.sign;
    return { handled: true, result: makeZero(sign) };
  }
  
  return { handled: false, result: null };
}

function handleSpecialDiv(a, b, tracer) {
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: 'NaN in div', snapshot: {} });
    return { handled: true, result: makeNaN() };
  }
  
  if (b.special === Special.ZERO) {
    if (a.special === Special.ZERO) {
      tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: '0/0 => NaN', snapshot: {} });
      return { handled: true, result: makeNaN() };
    }
    const sign = a.sign * b.sign;
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: 'x/0 => Inf', snapshot: { sign } });
    return { handled: true, result: makeInf(sign) };
  }
  
  if (a.special === Special.INF && b.special === Special.INF) {
    tracer.emit({ level: TraceLevel.INFO, phase: 'SPECIAL', message: 'inf/inf => NaN', snapshot: {} });
    return { handled: true, result: makeNaN() };
  }
  
  if (a.special === Special.INF) {
    const sign = a.sign * b.sign;
    return { handled: true, result: makeInf(sign) };
  }
  
  if (b.special === Special.INF) {
    const sign = a.sign * b.sign;
    return { handled: true, result: makeZero(sign) };
  }
  
  if (a.special === Special.ZERO) {
    const sign = a.sign * b.sign;
    return { handled: true, result: makeZero(sign) };
  }
  
  return { handled: false, result: null };
}

module.exports = {
  makeZero,
  makeInf,
  makeNaN,
  handleSpecialAdd,
  handleSpecialSub,
  handleSpecialMul,
  handleSpecialDiv
};
