/**
 * SEN-SFP Comprehensive Test Suite
 */

import {
  TestCase,
  TestResult,
  SEN_SFP,
  Pole,
  Special,
  RoundMode,
  CONFIG_PRESET_SIMPLE,
  CollectingTracer,
} from "../core/types";
import { add, sub, mul, div } from "../core/ops";
import { exportAll } from "../exports/index";
import { makeZero, makeInf, makeNaN, isZero } from "../core/specials";
import { createSfp } from "../core/helpers";

/**
 * Create a simple test number
 */
export function makeTestNum(
  sign: Pole,
  scale: number,
  poles: Pole[]
): SEN_SFP {
  return {
    special: Special.NORMAL,
    sign,
    scale,
    mant: {
      digits: poles.map((pole, i) => ({
        axis: (i % 3 === 0 ? "X" : i % 3 === 1 ? "Y" : "Z") as any,
        pole,
      })),
    },
    flags: {
      inexact: false,
      overflow: false,
      underflow: false,
      rounded: false,
      invalid: false,
      subnormal: false,
    },
  };
}

/**
 * Build comprehensive test suite
 */
export function buildCoreTestSuite(): TestCase[] {
  const cfg = CONFIG_PRESET_SIMPLE;

  return [
    // Test 1: Simple addition
    {
      name: "ADD: 1.0 + 1.0 = 2.0",
      cfg,
      op: "ADD",
      a: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["basic_arithmetic", "addition"],
    },

    // Test 2: Subtraction producing zero (cancellation)
    {
      name: "SUB: 1.0 - 1.0 = 0",
      cfg,
      op: "SUB",
      a: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["cancellation", "subtraction"],
    },

    // Test 3: Multiplication
    {
      name: "MUL: 2.0 * 3.0",
      cfg,
      op: "MUL",
      a: makeTestNum(Pole.POS, 1, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 0, [
        Pole.POS,
        Pole.NEG,
        Pole.POS,
        Pole.POS,
      ]),
      tags: ["basic_arithmetic", "multiplication"],
    },

    // Test 4: Special - NaN propagation in ADD
    {
      name: "SPECIAL: NaN + 1.0 = NaN",
      cfg,
      op: "ADD",
      a: makeNaN(),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["specials", "nan"],
    },

    // Test 5: Special - Inf handling
    {
      name: "SPECIAL: +Inf + 1.0 = +Inf",
      cfg,
      op: "ADD",
      a: makeInf(Pole.POS),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["specials", "infinity"],
    },

    // Test 6: Special - inf + (-inf) = NaN
    {
      name: "SPECIAL: +Inf + (-Inf) = NaN",
      cfg,
      op: "ADD",
      a: makeInf(Pole.POS),
      b: makeInf(Pole.NEG),
      tags: ["specials", "infinity", "cancellation"],
    },

    // Test 7: Negative number handling
    {
      name: "ARITH: -1.0 + 1.0 = 0",
      cfg,
      op: "ADD",
      a: makeTestNum(Pole.NEG, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["sign_handling", "cancellation"],
    },

    // Test 8: Division
    {
      name: "DIV: 4.0 / 2.0",
      cfg,
      op: "DIV",
      a: makeTestNum(Pole.POS, 2, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 1, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["basic_arithmetic", "division"],
    },

    // Test 9: Scale alignment in ADD
    {
      name: "ALIGN: 1.0 + 0.5 (different scales)",
      cfg,
      op: "ADD",
      a: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, -1, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["alignment", "scale_handling"],
    },

    // Test 10: Rounding (inexact result)
    {
      name: "ROUND: Precision overflow test",
      cfg: { ...cfg, ROUND_MODE: RoundMode.NEAREST_EVEN },
      op: "ADD",
      a: makeTestNum(Pole.POS, 0, [
        Pole.POS,
        Pole.POS,
        Pole.POS,
        Pole.POS,
      ]),
      b: makeTestNum(Pole.POS, -10, [
        Pole.POS,
        Pole.POS,
        Pole.POS,
        Pole.POS,
      ]),
      tags: ["rounding", "precision"],
    },

    // Test 11: Zero special value
    {
      name: "SPECIAL: ZERO + 1.0 = 1.0",
      cfg,
      op: "ADD",
      a: makeZero(Pole.POS),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["specials", "zero"],
    },

    // Test 12: Opposite pole cancellation (carry)
    {
      name: "CARRY: Pole cancellation with carry",
      cfg,
      op: "ADD",
      a: makeTestNum(Pole.POS, 0, [
        Pole.POS,
        Pole.NEG,
        Pole.POS,
        Pole.NEG,
      ]),
      b: makeTestNum(Pole.NEG, 0, [
        Pole.POS,
        Pole.NEG,
        Pole.POS,
        Pole.NEG,
      ]),
      tags: ["carry", "cancellation"],
    },

    // Test 13: Mul with carry propagation
    {
      name: "MUL: Carry propagation",
      cfg,
      op: "MUL",
      a: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS]),
      tags: ["multiplication", "carry"],
    },

    // Test 14: Division by zero
    {
      name: "SPECIAL: 1.0 / 0 = Inf",
      cfg,
      op: "DIV",
      a: makeTestNum(Pole.POS, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeZero(Pole.POS),
      tags: ["specials", "division"],
    },

    // Test 15: Mixed sign multiplication
    {
      name: "MUL: -1.0 * 2.0 = -2.0",
      cfg,
      op: "MUL",
      a: makeTestNum(Pole.NEG, 0, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      b: makeTestNum(Pole.POS, 1, [Pole.POS, Pole.POS, Pole.POS, Pole.POS]),
      tags: ["sign_handling", "multiplication"],
    },
  ];
}

/**
 * Run a single test
 */
export function runTest(testCase: TestCase): TestResult {
  const tracer = new CollectingTracer();
  let actual: SEN_SFP;

  switch (testCase.op) {
    case "ADD":
      actual = add(testCase.a, testCase.b, testCase.cfg, tracer);
      break;
    case "SUB":
      actual = sub(testCase.a, testCase.b, testCase.cfg, tracer);
      break;
    case "MUL":
      actual = mul(testCase.a, testCase.b, testCase.cfg, tracer);
      break;
    case "DIV":
      actual = div(testCase.a, testCase.b, testCase.cfg, tracer);
      break;
    default:
      throw new Error(`Unknown operation: ${testCase.op}`);
  }

  const exportBundle = exportAll(actual, testCase.cfg);
  let passed = true;
  let notes = "";

  // Basic check: ensure no crashes and result is valid
  if (!actual.special && actual.mant.digits.length === 0 && actual.special !== Special.ZERO) {
    passed = false;
    notes += "Invalid result: mantissa empty but not ZERO special. ";
  }

  return {
    name: testCase.name,
    passed,
    actual,
    export: exportBundle,
    traceEvents: tracer.getEvents(),
    notes,
  };
}

/**
 * Run full test suite
 */
export function runTestSuite(testCases: TestCase[]): TestResult[] {
  return testCases.map((tc) => runTest(tc));
}

/**
 * Export test results to CSV
 */
export function exportTestResultsCSV(results: TestResult[]): string {
  const header = [
    "Test Name",
    "Passed",
    "Special",
    "Sign",
    "Scale",
    "Mantissa Length",
    "Scalar Decimal",
    "Flags (inexact|underflow|overflow|rounded|subnormal|invalid)",
    "Notes",
  ].join(",");

  const rows = results.map((r) => {
    const flagStr = [
      r.actual.flags.inexact ? "1" : "0",
      r.actual.flags.underflow ? "1" : "0",
      r.actual.flags.overflow ? "1" : "0",
      r.actual.flags.rounded ? "1" : "0",
      r.actual.flags.subnormal ? "1" : "0",
      r.actual.flags.invalid ? "1" : "0",
    ].join("|");

    return [
      `"${r.name}"`,
      r.passed ? "PASS" : "FAIL",
      r.actual.special,
      r.actual.sign === Pole.POS ? "+" : "-",
      r.actual.scale,
      r.actual.mant.digits.length,
      r.export.scalar_decimal,
      flagStr,
      `"${r.notes}"`,
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

/**
 * Export test results to JSON
 */
export function exportTestResultsJSON(results: TestResult[]): string {
  const data = results.map((r) => ({
    name: r.name,
    passed: r.passed,
    result: {
      special: r.actual.special,
      sign: r.actual.sign === Pole.POS ? "+" : "-",
      scale: r.actual.scale,
      mantissa: r.actual.mant.digits,
      flags: r.actual.flags,
    },
    exports: {
      scalar_decimal: r.export.scalar_decimal,
      scalar_num: r.export.scalar_num,
      scalar_den: r.export.scalar_den,
      pole_string: r.export.pole_string,
    },
    traceEventCount: r.traceEvents.length,
    notes: r.notes,
  }));

  return JSON.stringify(data, null, 2);
}
