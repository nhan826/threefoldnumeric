/**
 * SEN-SFP Normalization Pipeline
 * Handles leading zero stripping, rounding, sign canonicalization, and finalization
 */

const { Special, Pole, SEN_SFP, SenMantissa, Flags, TraceLevel } = require('./types');
const { senToTmp, tmpToSen, normalizeSignTmp } = require('./helpers');
const { roundToPrecision } = require('./rounding');

/**
 * Merge two flag sets (OR operation)
 */
function mergeFlags(a, b) {
  return new Flags({
    inexact: a.inexact || b.inexact,
    underflow: a.underflow || b.underflow,
    overflow: a.overflow || b.overflow,
    rounded: a.rounded || b.rounded,
    subnormal: a.subnormal || b.subnormal,
    invalid: a.invalid || b.invalid
  });
}

/**
 * Finalize: handle overflow/underflow/subnormals
 */
function finalize(sign, scale, mant, f, cfg, tracer) {
  if (scale > cfg.E_MAX) {
    f.overflow = true;
    tracer.emit({
      level: TraceLevel.INFO,
      phase: 'FINALIZE',
      message: 'Overflow -> INF',
      snapshot: { scale, E_MAX: cfg.E_MAX }
    });
    return {
      special: Special.INF,
      sign,
      scale: 0,
      mant: new SenMantissa([]),
      flags: f
    };
  }
  
  if (scale < cfg.E_MIN) {
    if (!cfg.SUBNORMAL) {
      f.underflow = true;
      tracer.emit({
        level: TraceLevel.INFO,
        phase: 'FINALIZE',
        message: 'Underflow -> ZERO (no subnormals)',
        snapshot: { scale, E_MIN: cfg.E_MIN }
      });
      return {
        special: Special.ZERO,
        sign,
        scale: 0,
        mant: new SenMantissa([]),
        flags: f
      };
    }
    
    const shift = cfg.E_MIN - scale;
    f.subnormal = true;
    tracer.emit({
      level: TraceLevel.INFO,
      phase: 'FINALIZE',
      message: 'Subnormal shift',
      snapshot: { shift }
    });
    
    const { TmpMantissa } = require('./types');
    const { rightShiftTmp } = require('./helpers');
    let t = senToTmp(mant);
    t = rightShiftTmp(t, shift);
    
    return normalizePipeline(t, sign, cfg.E_MIN, cfg, tracer);
  }
  
  return {
    special: Special.NORMAL,
    sign,
    scale,
    mant,
    flags: f
  };
}

/**
 * Full normalization pipeline
 * Input: TmpMantissa, sign, scale
 * Output: { special, sign, scale, mant, flags }
 */
function normalizePipeline(tmp, sign, scale, cfg, tracer) {
  const f = new Flags();
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'NORMALIZE',
    message: 'Start normalization',
    snapshot: { scale_in: scale, len_in: tmp.digits.length }
  });
  
  // Strip leading zeros
  let i = 0;
  while (i < tmp.digits.length && tmp.digits[i].pole === 0) {
    i++;
    scale--;
  }
  
  if (i === tmp.digits.length) {
    tracer.emit({
      level: TraceLevel.INFO,
      phase: 'NORMALIZE',
      message: 'All digits canceled -> ZERO',
      snapshot: {}
    });
    return {
      special: Special.ZERO,
      sign: Pole.POS,
      scale: 0,
      mant: new SenMantissa([]),
      flags: f
    };
  }
  
  tmp.digits = tmp.digits.slice(i);
  tracer.emit({
    level: TraceLevel.DEBUG,
    phase: 'NORMALIZE',
    message: 'Leading zeros stripped',
    snapshot: { stripped: i, scale_now: scale, len: tmp.digits.length }
  });
  
  // Round
  const { tmp: rtmp, flags: rf, scaleAdjust } = roundToPrecision(tmp, sign, cfg, tracer);
  const fMerged = mergeFlags(f, rf);
  scale += scaleAdjust;
  
  // Sign canonicalization
  const { tmp: rtmp2, sign: signNew } = normalizeSignTmp(rtmp, sign);
  tracer.emit({
    level: TraceLevel.DEBUG,
    phase: 'NORMALIZE',
    message: 'Sign canonicalized',
    snapshot: { sign: signNew, scale }
  });
  
  // Convert to SenMantissa
  const mant = tmpToSen(rtmp2, fMerged);
  
  // Finalize (overflow/underflow/subnormal)
  const finalized = finalize(signNew, scale, mant, fMerged, cfg, tracer);
  tracer.emit({
    level: TraceLevel.INFO,
    phase: 'FINALIZE',
    message: 'Finalize done',
    snapshot: {
      special: finalized.special,
      scale: finalized.scale,
      sign: finalized.sign,
      flags: finalized.flags
    }
  });
  
  return finalized;
}

module.exports = {
  mergeFlags,
  finalize,
  normalizePipeline
};
