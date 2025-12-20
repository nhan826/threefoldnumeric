/**
 * SEN-SFP Helper Functions
 * Conversions, padding, shifts, and previews
 */

import {
  Axis,
  Pole,
  SenDigit,
  TmpDigit,
  SenMantissa,
  TmpMantissa,
  SEN_SFP,
  Flags,
  SfpConfig,
  Tracer,
  NullTracer,
} from "./types";

/**
 * Get axis for position (1-indexed)
 * Cycles X,Y,Z,X,Y,Z,...
 */
export function axisOfPosition(pos1: number): Axis {
  const r = (pos1 - 1) % 3;
  if (r === 0) return Axis.X;
  if (r === 1) return Axis.Y;
  return Axis.Z;
}

/**
 * Convert SEN mantissa to temporary mantissa (allows tri-state poles)
 */
export function senToTmp(mant: SenMantissa): TmpMantissa {
  const digits = mant.digits.map((d) => ({
    axis: d.axis,
    pole: d.pole === Pole.POS ? 1 : -1,
  }));
  return { digits };
}

/**
 * Convert temporary mantissa to SEN mantissa
 * TZERO poles (0) are converted to NEG with inexact flag
 */
export function tmpToSen(tmp: TmpMantissa, flags: Flags): SenMantissa {
  const digits: SenDigit[] = [];
  for (const td of tmp.digits) {
    let pole: Pole;
    if (td.pole === 0) {
      flags.inexact = true;
      pole = Pole.NEG;
    } else if (td.pole > 0) {
      pole = Pole.POS;
    } else {
      pole = Pole.NEG;
    }
    digits.push({ axis: td.axis, pole });
  }
  return { digits };
}

/**
 * Make empty mantissa
 */
export function makeEmptyMantissa(): SenMantissa {
  return { digits: [] };
}

/**
 * Make zero flags
 */
export function makeZeroFlags(): Flags {
  return {
    inexact: false,
    underflow: false,
    overflow: false,
    rounded: false,
    subnormal: false,
    invalid: false,
  };
}

/**
 * Clone flags
 */
export function cloneFlags(f: Flags): Flags {
  return { ...f };
}

/**
 * Left-pad TmpMantissa with zeros (TZERO) to reach length L
 */
export function leftPadZeros(tmp: TmpMantissa, L: number): TmpMantissa {
  const digits = [...tmp.digits];
  while (digits.length < L) {
    digits.unshift({
      axis: axisOfPosition(1),
      pole: 0,
    });
  }
  return { digits };
}

/**
 * Right-shift TmpMantissa by k positions (append k TZERO digits on left, i.e., prepend)
 */
export function rightShiftTmp(tmp: TmpMantissa, k: number): TmpMantissa {
  if (k <= 0) return tmp;
  const digits = [...tmp.digits];
  for (let i = 0; i < k; i++) {
    digits.unshift({
      axis: axisOfPosition(1),
      pole: 0,
    });
  }
  return { digits };
}

/**
 * Negate all poles in TmpMantissa
 */
export function negateTmp(tmp: TmpMantissa): TmpMantissa {
  const digits = tmp.digits.map((d) => ({
    axis: d.axis,
    pole: -d.pole,
  }));
  return { digits };
}

/**
 * Normalize sign of TmpMantissa:
 * If leading digit is negative, flip all poles and flip sign
 */
export function normalizeSignTmp(
  tmp: TmpMantissa,
  sign: Pole
): { tmp: TmpMantissa; sign: Pole } {
  if (tmp.digits.length === 0) return { tmp, sign };

  if (tmp.digits[0].pole < 0) {
    const digits = tmp.digits.map((d) => ({
      axis: d.axis,
      pole: -d.pole,
    }));
    return {
      tmp: { digits },
      sign: sign === Pole.POS ? Pole.NEG : Pole.POS,
    };
  }

  return { tmp, sign };
}

/**
 * Create preview snapshot for tracer
 */
export function preview(x: SEN_SFP): Record<string, unknown> {
  return {
    special: x.special,
    sign: x.sign,
    scale: x.scale,
    mant_len: x.mant.digits.length,
    flags: x.flags,
  };
}

/**
 * Clone TmpMantissa
 */
export function cloneTmp(tmp: TmpMantissa): TmpMantissa {
  return {
    digits: tmp.digits.map((d) => ({ ...d })),
  };
}

/**
 * Clone SEN_SFP
 */
export function cloneSfp(x: SEN_SFP): SEN_SFP {
  return {
    special: x.special,
    sign: x.sign,
    scale: x.scale,
    mant: {
      digits: x.mant.digits.map((d) => ({ ...d })),
    },
    flags: cloneFlags(x.flags),
  };
}

/**
 * Count leading zeros in TmpMantissa
 */
export function countLeadingZeros(tmp: TmpMantissa): number {
  let count = 0;
  for (const d of tmp.digits) {
    if (d.pole === 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Strip leading zeros and return new TmpMantissa
 */
export function stripLeadingZeros(tmp: TmpMantissa): TmpMantissa {
  let i = 0;
  while (i < tmp.digits.length && tmp.digits[i].pole === 0) {
    i++;
  }
  return { digits: tmp.digits.slice(i) };
}

/**
 * Create TmpMantissa with all +1 poles (used for constants like 2.0)
 */
export function createTmpAllPos(P: number): TmpMantissa {
  const digits: TmpDigit[] = [];
  for (let i = 0; i < P; i++) {
    digits.push({
      axis: axisOfPosition(i + 1),
      pole: 1,
    });
  }
  return { digits };
}

/**
 * Create SEN_SFP number from sign, scale, and SEN mantissa
 */
export function createSfp(
  sign: Pole,
  scale: number,
  mant: SenMantissa,
  flags?: Partial<Flags>
): SEN_SFP {
  return {
    special: mant.digits.length > 0 ? "NORMAL" : "ZERO",
    sign,
    scale,
    mant,
    flags: {
      inexact: flags?.inexact ?? false,
      underflow: flags?.underflow ?? false,
      overflow: flags?.overflow ?? false,
      rounded: flags?.rounded ?? false,
      subnormal: flags?.subnormal ?? false,
      invalid: flags?.invalid ?? false,
    },
  };
}
