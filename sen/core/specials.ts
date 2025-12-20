/**
 * Special Value Handlers for SEN-SFP
 * Handles NaN, Inf, Zero special cases
 */

import {
  Special,
  Pole,
  SEN_SFP,
  Tracer,
  NullTracer,
  Flags,
} from "./types";
import { makeEmptyMantissa, makeZeroFlags, cloneFlags } from "./helpers";

/**
 * Create a zero SEN_SFP
 */
export function makeZero(sign: Pole = Pole.POS): SEN_SFP {
  return {
    special: Special.ZERO,
    sign,
    scale: 0,
    mant: makeEmptyMantissa(),
    flags: makeZeroFlags(),
  };
}

/**
 * Create an infinity SEN_SFP
 */
export function makeInf(sign: Pole = Pole.POS): SEN_SFP {
  return {
    special: Special.INF,
    sign,
    scale: 0,
    mant: makeEmptyMantissa(),
    flags: makeZeroFlags(),
  };
}

/**
 * Create a NaN SEN_SFP
 */
export function makeNaN(): SEN_SFP {
  const flags = makeZeroFlags();
  flags.invalid = true;
  return {
    special: Special.NAN,
    sign: Pole.POS,
    scale: 0,
    mant: makeEmptyMantissa(),
    flags,
  };
}

/**
 * Handle special cases for addition
 * Returns (handled: bool, result: SEN_SFP)
 */
export function handleSpecialAdd(
  a: SEN_SFP,
  b: SEN_SFP,
  tracer: Tracer = new NullTracer()
): { handled: boolean; result: SEN_SFP | null } {
  // NaN propagation
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "NaN encountered in ADD",
      snapshot: { a_special: a.special, b_special: b.special },
    });
    return { handled: true, result: makeNaN() };
  }

  // inf + (-inf) = NaN
  if (
    a.special === Special.INF &&
    b.special === Special.INF &&
    a.sign !== b.sign
  ) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "inf + (-inf) => NaN",
      snapshot: {},
    });
    return { handled: true, result: makeNaN() };
  }

  // inf dominant
  if (a.special === Special.INF) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "INF returned from ADD (a is INF)",
      snapshot: { sign: a.sign },
    });
    return { handled: true, result: makeInf(a.sign) };
  }

  if (b.special === Special.INF) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "INF returned from ADD (b is INF)",
      snapshot: { sign: b.sign },
    });
    return { handled: true, result: makeInf(b.sign) };
  }

  // Zero identity
  if (a.special === Special.ZERO) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "a is ZERO, returning b",
      snapshot: {},
    });
    return { handled: true, result: b };
  }

  if (b.special === Special.ZERO) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "b is ZERO, returning a",
      snapshot: {},
    });
    return { handled: true, result: a };
  }

  return { handled: false, result: null };
}

/**
 * Handle special cases for subtraction (a - b)
 */
export function handleSpecialSub(
  a: SEN_SFP,
  b: SEN_SFP,
  tracer: Tracer = new NullTracer()
): { handled: boolean; result: SEN_SFP | null } {
  // NaN propagation
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "NaN encountered in SUB",
      snapshot: { a_special: a.special, b_special: b.special },
    });
    return { handled: true, result: makeNaN() };
  }

  // inf - inf = NaN
  if (a.special === Special.INF && b.special === Special.INF && a.sign === b.sign) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "inf - inf => NaN",
      snapshot: {},
    });
    return { handled: true, result: makeNaN() };
  }

  // inf dominant
  if (a.special === Special.INF) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "INF returned from SUB (a is INF)",
      snapshot: { sign: a.sign },
    });
    return { handled: true, result: makeInf(a.sign) };
  }

  if (b.special === Special.INF) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "INF returned from SUB (b is INF, negated)",
      snapshot: { sign: -b.sign as Pole },
    });
    return { handled: true, result: makeInf(-b.sign as Pole) };
  }

  // Zero cases
  if (a.special === Special.ZERO && b.special === Special.ZERO) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "Both operands are ZERO in SUB",
      snapshot: {},
    });
    return { handled: true, result: makeZero(Pole.POS) };
  }

  if (a.special === Special.ZERO) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "a is ZERO in SUB, returning -b",
      snapshot: {},
    });
    const negB = {
      ...b,
      sign: -b.sign as Pole,
    };
    return { handled: true, result: negB };
  }

  if (b.special === Special.ZERO) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "b is ZERO in SUB, returning a",
      snapshot: {},
    });
    return { handled: true, result: a };
  }

  return { handled: false, result: null };
}

/**
 * Handle special cases for multiplication
 */
export function handleSpecialMul(
  a: SEN_SFP,
  b: SEN_SFP,
  tracer: Tracer = new NullTracer()
): { handled: boolean; result: SEN_SFP | null } {
  // NaN propagation
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "NaN encountered in MUL",
      snapshot: { a_special: a.special, b_special: b.special },
    });
    return { handled: true, result: makeNaN() };
  }

  // 0 * inf = NaN
  if (
    (a.special === Special.ZERO && b.special === Special.INF) ||
    (a.special === Special.INF && b.special === Special.ZERO)
  ) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "0 * inf => NaN",
      snapshot: {},
    });
    return { handled: true, result: makeNaN() };
  }

  // inf * x = inf (sign = sign(a) * sign(b))
  if (a.special === Special.INF || b.special === Special.INF) {
    const sign = (a.sign * b.sign) as Pole;
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "INF returned from MUL",
      snapshot: { sign },
    });
    return { handled: true, result: makeInf(sign) };
  }

  // 0 * x = 0
  if (a.special === Special.ZERO || b.special === Special.ZERO) {
    const sign = (a.sign * b.sign) as Pole;
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "ZERO returned from MUL",
      snapshot: { sign },
    });
    return { handled: true, result: makeZero(sign) };
  }

  return { handled: false, result: null };
}

/**
 * Handle special cases for division (a / b)
 */
export function handleSpecialDiv(
  a: SEN_SFP,
  b: SEN_SFP,
  tracer: Tracer = new NullTracer()
): { handled: boolean; result: SEN_SFP | null } {
  // NaN propagation
  if (a.special === Special.NAN || b.special === Special.NAN) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "NaN encountered in DIV",
      snapshot: { a_special: a.special, b_special: b.special },
    });
    return { handled: true, result: makeNaN() };
  }

  // Division by zero
  if (b.special === Special.ZERO) {
    if (a.special === Special.ZERO) {
      tracer.emit({
        level: "INFO",
        phase: "SPECIAL",
        message: "0 / 0 => NaN",
        snapshot: {},
      });
      return { handled: true, result: makeNaN() };
    }
    const sign = (a.sign * b.sign) as Pole;
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "Division by zero => INF",
      snapshot: { sign },
    });
    return { handled: true, result: makeInf(sign) };
  }

  // inf / inf = NaN
  if (a.special === Special.INF && b.special === Special.INF) {
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "inf / inf => NaN",
      snapshot: {},
    });
    return { handled: true, result: makeNaN() };
  }

  // inf / x = inf
  if (a.special === Special.INF) {
    const sign = (a.sign * b.sign) as Pole;
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "INF / x => INF",
      snapshot: { sign },
    });
    return { handled: true, result: makeInf(sign) };
  }

  // x / inf = 0
  if (b.special === Special.INF) {
    const sign = (a.sign * b.sign) as Pole;
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "x / INF => ZERO",
      snapshot: { sign },
    });
    return { handled: true, result: makeZero(sign) };
  }

  // 0 / x = 0
  if (a.special === Special.ZERO) {
    const sign = (a.sign * b.sign) as Pole;
    tracer.emit({
      level: "INFO",
      phase: "SPECIAL",
      message: "0 / x => ZERO",
      snapshot: { sign },
    });
    return { handled: true, result: makeZero(sign) };
  }

  return { handled: false, result: null };
}

/**
 * Check if SEN_SFP is special
 */
export function isSpecial(x: SEN_SFP): boolean {
  return x.special !== Special.NORMAL;
}

/**
 * Check if SEN_SFP is zero
 */
export function isZero(x: SEN_SFP): boolean {
  return x.special === Special.ZERO;
}

/**
 * Check if SEN_SFP is infinity
 */
export function isInf(x: SEN_SFP): boolean {
  return x.special === Special.INF;
}

/**
 * Check if SEN_SFP is NaN
 */
export function isNaN(x: SEN_SFP): boolean {
  return x.special === Special.NAN;
}
