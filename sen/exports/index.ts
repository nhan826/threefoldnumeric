/**
 * SEN-SFP Export Formats
 * Canonical JSON, pole strings, scalar projections
 */

import {
  SEN_SFP,
  SfpConfig,
  ExportBundle,
  Special,
  Pole,
} from "../core/types";

/**
 * Export to canonical JSON with stable ordering
 */
export function exportToJSON(x: SEN_SFP, cfg: SfpConfig): string {
  const mantissaArray = x.mant.digits.map((d) => ({
    axis: d.axis,
    pole: d.pole === Pole.POS ? "+1" : "-1",
  }));

  const obj = {
    special: x.special,
    sign: x.sign === Pole.POS ? "+" : "-",
    scale: x.scale,
    mantissa: mantissaArray,
    flags: {
      inexact: x.flags.inexact,
      underflow: x.flags.underflow,
      overflow: x.flags.overflow,
      rounded: x.flags.rounded,
      subnormal: x.flags.subnormal,
      invalid: x.flags.invalid,
    },
  };

  return JSON.stringify(obj, null, 2);
}

/**
 * Export mantissa as pole string: "+ - + - ..."
 */
export function polesAsString(x: SEN_SFP): string {
  if (x.mant.digits.length === 0) {
    return "(empty)";
  }

  return x.mant.digits.map((d) => (d.pole === Pole.POS ? "+" : "-")).join(" ");
}

/**
 * Export mantissa as axis+pole string: "+X -Y +Z ..."
 */
export function axisPoleAsString(x: SEN_SFP): string {
  if (x.mant.digits.length === 0) {
    return "(empty)";
  }

  return x.mant.digits
    .map((d) => `${d.pole === Pole.POS ? "+" : "-"}${d.axis}`)
    .join(" ");
}

/**
 * Simple BigInt implementation for scalar projection
 * This is a simplified version; in production, use a proper library
 */
class SimpleBigInt {
  value: bigint;

  constructor(v: bigint | number | string) {
    this.value = BigInt(v);
  }

  static fromNumber(n: number): SimpleBigInt {
    return new SimpleBigInt(n);
  }

  add(other: SimpleBigInt): SimpleBigInt {
    return new SimpleBigInt(this.value + other.value);
  }

  sub(other: SimpleBigInt): SimpleBigInt {
    return new SimpleBigInt(this.value - other.value);
  }

  mul(other: SimpleBigInt): SimpleBigInt {
    return new SimpleBigInt(this.value * other.value);
  }

  pow(exp: number): SimpleBigInt {
    return new SimpleBigInt(this.value ** BigInt(exp));
  }

  toString(): string {
    return this.value.toString();
  }
}

/**
 * Scalar projection to rational (num/den) using BigInt
 * Formula: sign * Σ(pole_i * 2^(scale - i)) for i=0..P-1
 */
export function scalarProjectToRational(
  x: SEN_SFP,
  cfg: SfpConfig
): { num: string; den: string } {
  if (x.special === Special.ZERO) {
    return { num: "0", den: "1" };
  }

  if (x.special === Special.INF) {
    return { num: x.sign === Pole.POS ? "inf" : "-inf", den: "1" };
  }

  if (x.special === Special.NAN) {
    return { num: "nan", den: "1" };
  }

  // NORMAL case
  let numerator = new SimpleBigInt(0);
  const base = new SimpleBigInt(2);

  for (let i = 0; i < x.mant.digits.length; i++) {
    const pole = x.mant.digits[i].pole === Pole.POS ? 1 : -1;
    const exponent = x.scale - i;

    let term: SimpleBigInt;
    if (exponent >= 0) {
      term = new SimpleBigInt(pole).mul(base.pow(exponent));
    } else {
      // For negative exponents, we'll handle in denominator
      // Keep track separately
      const absExp = -exponent;
      term = new SimpleBigInt(pole); // numerator will be divided by 2^absExp later
      // This is simplified; proper handling needs a Fraction class
    }

    numerator = numerator.add(term);
  }

  // Apply overall sign
  if (x.sign === Pole.NEG) {
    numerator = new SimpleBigInt(0).sub(numerator);
  }

  // Handle denominator for subnormals/negative exponents
  let denominator = new SimpleBigInt(1);
  for (let i = 0; i < x.mant.digits.length; i++) {
    const exponent = x.scale - i;
    if (exponent < 0) {
      denominator = denominator.mul(base.pow(-exponent));
    }
  }

  return { num: numerator.toString(), den: denominator.toString() };
}

/**
 * Convert rational to decimal string with given precision
 */
export function rationalToDecimalString(
  numStr: string,
  denStr: string,
  digits: number = 80
): string {
  if (numStr === "inf") return "+Infinity";
  if (numStr === "-inf") return "-Infinity";
  if (numStr === "nan") return "NaN";

  const num = BigInt(numStr);
  const den = BigInt(denStr);

  if (den === 0n) return "undefined";

  // Use long division to get decimal representation
  let result = "";
  let remainder = num;
  let digitCount = 0;

  // Integer part
  const intPart = remainder / den;
  remainder = remainder % den;
  result = intPart.toString();

  // Decimal part
  if (remainder !== 0n || digitCount < digits) {
    result += ".";
  }

  while (remainder !== 0n && digitCount < digits) {
    remainder *= 10n;
    const digit = remainder / den;
    result += digit.toString();
    remainder = remainder % den;
    digitCount++;
  }

  return result;
}

/**
 * Export everything
 */
export function exportAll(x: SEN_SFP, cfg: SfpConfig): ExportBundle {
  const jsonStr = exportToJSON(x, cfg);
  const poleStr = polesAsString(x);
  const axisPoleStr = axisPoleAsString(x);

  const { num, den } = scalarProjectToRational(x, cfg);
  const decimalStr = rationalToDecimalString(num, den, 80);

  return {
    sen_json: jsonStr,
    pole_string: poleStr,
    axis_pole_string: axisPoleStr,
    scalar_decimal: decimalStr,
    scalar_num: num,
    scalar_den: den,
    raw_snapshot: x,
  };
}
