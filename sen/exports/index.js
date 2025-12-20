/**
 * SEN-SFP Exports
 * Multiple export formats for comparison and analysis
 */

const { Pole, Special } = require('../core/types');

/**
 * Export as canonical JSON
 */
function canonicalSenJson(x, cfg) {
  const obj = {
    special: x.special,
    sign: x.sign === Pole.POS ? '+' : '-',
    scale: x.scale,
    mantissa: x.mant.digits.map(d => ({
      axis: d.axis,
      pole: d.pole === Pole.POS ? '+' : '-'
    })),
    flags: {
      inexact: x.flags.inexact,
      overflow: x.flags.overflow,
      underflow: x.flags.underflow,
      rounded: x.flags.rounded,
      subnormal: x.flags.subnormal,
      invalid: x.flags.invalid
    },
    P: cfg.P
  };
  return JSON.stringify(obj, null, 2);
}

/**
 * Export mantissa as pole string: "+ - + - ..."
 */
function polesAsString(x) {
  return x.mant.digits.map(d => d.pole === Pole.POS ? '+' : '-').join(' ');
}

/**
 * Export mantissa as axis+pole string: "+X -Y +Z ..."
 */
function axisPoleAsString(x) {
  return x.mant.digits.map(d => {
    const p = d.pole === Pole.POS ? '+' : '-';
    return p + d.axis;
  }).join(' ');
}

/**
 * Scalar projection to rational (num/den)
 * value ≈ sign * Σ_i (pole_i * 2^(scale - i))
 */
function scalarProjectToRational(x, cfg) {
  if (x.special === Special.ZERO) {
    return { num: 0n, den: 1n };
  }
  if (x.special === Special.INF) {
    return { num: x.sign === Pole.POS ? 1n : -1n, den: 0n, isInf: true };
  }
  if (x.special === Special.NAN) {
    return { num: 0n, den: 0n, isNan: true };
  }
  
  // For NORMAL: compute sum of (pole_i * 2^(scale-i))
  let num = 0n;
  for (let i = 0; i < x.mant.digits.length; i++) {
    const pole = x.mant.digits[i].pole;
    const exp = x.scale - i;
    if (exp >= 0) {
      num += BigInt(pole) * (1n << BigInt(exp));
    } else {
      // For negative exponents, we'll handle with denominator
      const absExp = -exp;
      num = num * (1n << BigInt(absExp)) + BigInt(pole);
      // Track denominator adjustment needed
    }
  }
  
  // Simplified: assume all exponents >= 0 for this demo
  if (x.sign === Pole.NEG) num = -num;
  
  return { num, den: 1n };
}

/**
 * Convert rational to decimal string
 */
function rationalToDecimalString(num, den, digits = 80) {
  if (den === 0n) {
    if (num === 0n) return 'NaN';
    return num > 0n ? 'Inf' : '-Inf';
  }
  
  // Long division to compute decimal representation
  let intPart = num / den;
  let remainder = num % den;
  
  let result = intPart.toString();
  result += '.';
  
  for (let i = 0; i < digits; i++) {
    remainder *= 10n;
    const digit = remainder / den;
    result += digit.toString();
    remainder = remainder % den;
    if (remainder === 0n) break;
  }
  
  return result;
}

/**
 * Export bundle with all formats
 */
function exportAll(x, cfg) {
  const json = canonicalSenJson(x, cfg);
  const polesStr = polesAsString(x);
  const axisPoleStr = axisPoleAsString(x);
  
  const rational = scalarProjectToRational(x, cfg);
  const decStr = rationalToDecimalString(rational.num, rational.den, 80);
  
  return {
    sen_json: json,
    pole_string: polesStr,
    axis_pole_string: axisPoleStr,
    scalar_decimal: decStr,
    scalar_num: rational.num.toString(),
    scalar_den: rational.den.toString(),
    special: x.special,
    flags: x.flags
  };
}

module.exports = {
  canonicalSenJson,
  polesAsString,
  axisPoleAsString,
  scalarProjectToRational,
  rationalToDecimalString,
  exportAll
};
