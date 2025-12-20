/**
 * SEN-SFP Comparison
 */

import {
  SEN_SFP,
  SfpConfig,
  ComparisonResult,
  Special,
  Pole,
} from "./types";

/**
 * Compare two SEN_SFP numbers
 * Returns LT, EQ, GT, or UNORDERED (for NaN)
 */
export function compare(a: SEN_SFP, b: SEN_SFP, cfg: SfpConfig): ComparisonResult {
  // NaN handling
  if (a.special === Special.NAN || b.special === Special.NAN) {
    return ComparisonResult.UNORDERED;
  }

  // Special value ordering: -INF < NORMAL < +INF
  // ZERO is treated as 0
  
  // Handle inf
  if (a.special === Special.INF && b.special === Special.INF) {
    if (a.sign === b.sign) return ComparisonResult.EQ;
    return a.sign === Pole.NEG ? ComparisonResult.LT : ComparisonResult.GT;
  }

  if (a.special === Special.INF) {
    return a.sign === Pole.NEG ? ComparisonResult.LT : ComparisonResult.GT;
  }

  if (b.special === Special.INF) {
    return b.sign === Pole.NEG ? ComparisonResult.GT : ComparisonResult.LT;
  }

  // Handle zero
  if (a.special === Special.ZERO && b.special === Special.ZERO) {
    return ComparisonResult.EQ;
  }

  if (a.special === Special.ZERO) {
    return b.sign === Pole.NEG ? ComparisonResult.GT : ComparisonResult.LT;
  }

  if (b.special === Special.ZERO) {
    return a.sign === Pole.NEG ? ComparisonResult.LT : ComparisonResult.GT;
  }

  // Both are NORMAL
  // Compare by sign first
  if (a.sign !== b.sign) {
    return a.sign === Pole.NEG ? ComparisonResult.LT : ComparisonResult.GT;
  }

  // Same sign: compare by scale
  if (a.scale !== b.scale) {
    if (a.sign === Pole.POS) {
      return a.scale < b.scale ? ComparisonResult.LT : ComparisonResult.GT;
    } else {
      return a.scale > b.scale ? ComparisonResult.LT : ComparisonResult.GT;
    }
  }

  // Same scale: compare mantissa lexicographically
  const maxLen = Math.max(a.mant.digits.length, b.mant.digits.length);

  for (let i = 0; i < maxLen; i++) {
    const ap = a.mant.digits[i]?.pole ?? Pole.NEG;
    const bp = b.mant.digits[i]?.pole ?? Pole.NEG;

    if (ap !== bp) {
      if (a.sign === Pole.POS) {
        return ap === Pole.NEG ? ComparisonResult.LT : ComparisonResult.GT;
      } else {
        return ap === Pole.NEG ? ComparisonResult.GT : ComparisonResult.LT;
      }
    }
  }

  return ComparisonResult.EQ;
}

/**
 * Check equality
 */
export function isEqual(a: SEN_SFP, b: SEN_SFP, cfg: SfpConfig): boolean {
  return compare(a, b, cfg) === ComparisonResult.EQ;
}

/**
 * Check less than
 */
export function isLessThan(a: SEN_SFP, b: SEN_SFP, cfg: SfpConfig): boolean {
  return compare(a, b, cfg) === ComparisonResult.LT;
}

/**
 * Check greater than
 */
export function isGreaterThan(a: SEN_SFP, b: SEN_SFP, cfg: SfpConfig): boolean {
  return compare(a, b, cfg) === ComparisonResult.GT;
}
