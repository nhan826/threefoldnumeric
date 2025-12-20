/**
 * SEN-SFP Core Types and Definitions
 * Structure-preserving floating-point format
 */

// Enums
export enum Axis {
  X = "X",
  Y = "Y",
  Z = "Z",
}

export enum Pole {
  NEG = -1,
  POS = 1,
}

export enum TPole {
  TNEG = -1,
  TZERO = 0,
  TPOS = 1,
}

export enum Special {
  NORMAL = "NORMAL",
  ZERO = "ZERO",
  INF = "INF",
  NAN = "NAN",
}

export enum RoundMode {
  NEAREST_EVEN = "NEAREST_EVEN",
  TOWARD_ZERO = "TOWARD_ZERO",
  UP = "UP",
  DOWN = "DOWN",
  STOCHASTIC = "STOCHASTIC",
}

export enum TraceLevel {
  INFO = "INFO",
  DEBUG = "DEBUG",
}

// SEN Digit (mantissa element)
export interface SenDigit {
  axis: Axis;
  pole: Pole;
}

// Temporary digit (allows tri-state poles)
export interface TmpDigit {
  axis: Axis;
  pole: number; // -1, 0, or +1
}

// Mantissas
export interface SenMantissa {
  digits: SenDigit[];
}

export interface TmpMantissa {
  digits: TmpDigit[];
}

// Flags
export interface Flags {
  inexact: boolean;
  underflow: boolean;
  overflow: boolean;
  rounded: boolean;
  subnormal: boolean;
  invalid: boolean;
}

// Configuration
export interface SfpConfig {
  P: number; // Precision (number of mantissa digits)
  E_MIN: number; // Minimum exponent
  E_MAX: number; // Maximum exponent
  SUBNORMAL: boolean; // Enable subnormal numbers
  ROUND_MODE: RoundMode; // Rounding mode
  STOCH_SEED: number; // Seed for stochastic rounding
}

// Main SEN-SFP number type
export interface SEN_SFP {
  special: Special;
  sign: Pole;
  scale: number; // Unbiased exponent
  mant: SenMantissa;
  flags: Flags;
}

// Trace event
export interface TraceEvent {
  level: TraceLevel;
  phase: string;
  message: string;
  snapshot: Record<string, unknown>;
  timestamp?: number;
}

// Tracer interface
export interface Tracer {
  emit(event: TraceEvent): void;
}

// Collecting tracer
export class NullTracer implements Tracer {
  emit(_event: TraceEvent): void {
    // No-op
  }
}

export class CollectingTracer implements Tracer {
  events: TraceEvent[] = [];

  emit(event: TraceEvent): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });
  }

  getEvents(): TraceEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}

// Export bundle
export interface ExportBundle {
  sen_json: string;
  pole_string: string;
  axis_pole_string: string;
  scalar_decimal: string;
  scalar_num: string; // BigInt as string
  scalar_den: string; // BigInt as string
  raw_snapshot: SEN_SFP;
}

// Test case
export interface TestCase {
  name: string;
  cfg: SfpConfig;
  op: "ADD" | "SUB" | "MUL" | "DIV";
  a: SEN_SFP;
  b: SEN_SFP;
  expected?: SEN_SFP;
  expectFlags?: Partial<Flags>;
  tags: string[];
}

// Test result
export interface TestResult {
  name: string;
  passed: boolean;
  actual: SEN_SFP;
  export: ExportBundle;
  traceEvents: TraceEvent[];
  notes: string;
}

// Reciprocal result
export interface ReciprocalResult {
  mant: TmpMantissa;
  scaleAdjust: number;
  flags: Flags;
}

// Comparison result
export enum ComparisonResult {
  LT = "LT",
  EQ = "EQ",
  GT = "GT",
  UNORDERED = "UNORDERED",
}

// Standard config presets
export const CONFIG_PRESET_SFP32 = {
  P: 8,
  E_MIN: -126,
  E_MAX: 127,
  SUBNORMAL: true,
  ROUND_MODE: RoundMode.NEAREST_EVEN,
  STOCH_SEED: 0,
};

export const CONFIG_PRESET_SFP64 = {
  P: 16,
  E_MIN: -1022,
  E_MAX: 1023,
  SUBNORMAL: true,
  ROUND_MODE: RoundMode.NEAREST_EVEN,
  STOCH_SEED: 0,
};

export const CONFIG_PRESET_SIMPLE = {
  P: 4,
  E_MIN: -10,
  E_MAX: 10,
  SUBNORMAL: false,
  ROUND_MODE: RoundMode.NEAREST_EVEN,
  STOCH_SEED: 0,
};
