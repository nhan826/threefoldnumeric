/**
 * SEN-SFP Core Types
 * Defines all fundamental types, enums, and data structures
 */

// Enums
const Axis = {
  X: 'X',
  Y: 'Y',
  Z: 'Z'
};

const Pole = {
  NEG: -1,
  POS: +1
};

const Special = {
  NORMAL: 'NORMAL',
  ZERO: 'ZERO',
  INF: 'INF',
  NAN: 'NAN'
};

const RoundMode = {
  NEAREST_EVEN: 'NEAREST_EVEN',
  TOWARD_ZERO: 'TOWARD_ZERO',
  UP: 'UP',
  DOWN: 'DOWN',
  STOCHASTIC: 'STOCHASTIC'
};

const TraceLevel = {
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Data structures
class SenDigit {
  constructor(axis, pole) {
    this.axis = axis; // Axis enum
    this.pole = pole; // Pole.NEG or Pole.POS
  }
}

class TmpDigit {
  constructor(axis, pole) {
    this.axis = axis;
    this.pole = pole; // -1, 0, or +1 (allows intermediate values)
  }
}

class SenMantissa {
  constructor(digits = []) {
    this.digits = digits; // array<SenDigit>, MSB->LSB
  }
}

class TmpMantissa {
  constructor(digits = []) {
    this.digits = digits; // array<TmpDigit>, MSB->LSB
  }
}

class Flags {
  constructor(overrides = {}) {
    this.inexact = overrides.inexact || false;
    this.underflow = overrides.underflow || false;
    this.overflow = overrides.overflow || false;
    this.rounded = overrides.rounded || false;
    this.subnormal = overrides.subnormal || false;
    this.invalid = overrides.invalid || false;
  }
}

class SfpConfig {
  constructor(P, E_MIN, E_MAX, SUBNORMAL = false, ROUND_MODE = RoundMode.NEAREST_EVEN, STOCH_SEED = 0) {
    this.P = P;
    this.E_MIN = E_MIN;
    this.E_MAX = E_MAX;
    this.SUBNORMAL = SUBNORMAL;
    this.ROUND_MODE = ROUND_MODE;
    this.STOCH_SEED = STOCH_SEED;
  }
}

class SEN_SFP {
  constructor(special = Special.NORMAL, sign = Pole.POS, scale = 0, mant = null, flags = null) {
    this.special = special;
    this.sign = sign; // Pole.NEG or Pole.POS
    this.scale = scale;
    this.mant = mant || new SenMantissa([]);
    this.flags = flags || new Flags();
  }
}

class TraceEvent {
  constructor(level, phase, message, snapshot = {}) {
    this.level = level;
    this.phase = phase;
    this.message = message;
    this.snapshot = snapshot;
  }
}

class NullTracer {
  emit(event) {
    // no-op
  }
}

class CollectingTracer {
  constructor() {
    this.events = [];
  }

  emit(event) {
    this.events.push(event);
  }

  getEvents() {
    return this.events;
  }
}

module.exports = {
  Axis,
  Pole,
  Special,
  RoundMode,
  TraceLevel,
  SenDigit,
  TmpDigit,
  SenMantissa,
  TmpMantissa,
  Flags,
  SfpConfig,
  SEN_SFP,
  TraceEvent,
  NullTracer,
  CollectingTracer,
  
  // Preset configs
  CONFIG_PRESET_SIMPLE: new SfpConfig(4, -10, 10, false, RoundMode.NEAREST_EVEN, 42)
};
