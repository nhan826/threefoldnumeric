# SEN-SFP: Structure-Preserving SEN Floating-Point System

A comprehensive, deterministic floating-point arithmetic system implementing the Structure-preserving SEN (Signed Exponential Notation) floating-point format with full trace transparency and standardized exports.

## Overview

The SEN-SFP system provides:

1. **Deterministic Core Arithmetic Library** - Pure, immutable floating-point operations with optional tracing
2. **Multiple Export Formats** - Canonical JSON, pole strings, scalar projections, and CSV/JSON exports
3. **Comprehensive Test Suite** - 15+ deterministic test cases covering all major algorithm behaviors
4. **Interactive UI Explorer** - Visual representation of operations with real-time trace events
5. **Batch Test Runner** - Run the full test suite and export results in standard formats

## Directory Structure

```
sen/
├── core/
│   ├── types.ts              # Core types, enums, interfaces, config presets
│   ├── tracer.ts             # Tracer interface (included in types.ts)
│   ├── helpers.ts            # Conversions, padding, shifts, helpers
│   ├── specials.ts           # NaN/Inf/Zero handlers for all operations
│   ├── normalize.ts          # Rounding, carry resolution, normalization pipeline
│   ├── ops.ts                # Add, Sub, Mul, Div, alignment, mantissa ops
│   └── compare.ts            # Comparison operations
├── exports/
│   └── index.ts              # JSON, pole string, scalar, CSV/JSON exporters
├── tests/
│   └── index.ts              # Test suite, runner, result exporters
└── index.ts                  # Main export re-export

components/
├── SENSFPExplorer.jsx        # Main explorer component (calculator + test runner)
├── SENInputPanel.jsx         # Input panel with operand and config controls
├── SENResultPanel.jsx        # Result display and export buttons
├── SENTraceTimeline.jsx      # Trace event visualization
└── SENTestRunner.jsx         # Batch test suite runner

pages/
└── sensfp.js                 # New SEN-SFP page entry point
```

## Key Features

### 1. Core Arithmetic (TypeScript)

Implements all major operations with full support for:
- **Numbers**: NORMAL, ZERO, INF, NAN
- **Operations**: Add, Sub, Mul, Div with proper special value handling
- **Precision Control**: Configurable precision (P), exponent range (E_MIN/E_MAX)
- **Rounding Modes**: NEAREST_EVEN, TOWARD_ZERO, UP, DOWN, STOCHASTIC
- **Subnormal Support**: Optional subnormal number handling

### 2. Trace Events

Every operation emits structured trace events:
- **SPECIAL**: Special value handling decisions
- **ALIGN**: Scale alignment for add/sub
- **ADD_RAW/MUL_RAW/RECIP**: Raw operation results
- **CARRY**: Balanced carry resolution
- **NORMALIZE**: Normalization pipeline steps
- **ROUND**: Rounding decisions and outcomes
- **FINALIZE**: Overflow/underflow handling
- **OP**: Operation start/completion

### 3. Export Formats

Multiple standardized output formats:

**JSON Export** (Canonical, stable ordering):
```json
{
  "special": "NORMAL",
  "sign": "+",
  "scale": 5,
  "mantissa": [
    {"axis": "X", "pole": "+1"},
    {"axis": "Y", "pole": "-1"},
    ...
  ],
  "flags": {
    "inexact": false,
    "underflow": false,
    "overflow": false,
    ...
  }
}
```

**Pole String**: `+ - + - + - + -`

**Axis-Pole String**: `+X -Y +Z -X ...`

**Scalar Decimal**: `1.234567890...` (computed from pole/scale)

**Scalar Rational**: `num / den` (BigInt representation)

### 4. Test Suite (15+ Deterministic Tests)

Comprehensive coverage:
- Basic arithmetic (ADD, SUB, MUL, DIV)
- Special values (NaN, Inf, Zero)
- Cancellation and leading zero stripping
- Carry propagation and resolution
- Scale alignment
- Rounding behaviors (exact, ties, inexact)
- Overflow and underflow
- Sign handling

Run tests and export results as CSV or JSON for comparison with other systems.

## Configuration Presets

```typescript
CONFIG_PRESET_SIMPLE   // P=4,  E_MIN=-10, E_MAX=10
CONFIG_PRESET_SFP32    // P=8,  E_MIN=-126, E_MAX=127
CONFIG_PRESET_SFP64    // P=16, E_MIN=-1022, E_MAX=1023
```

## UI/UX Components

### Interactive Calculator
1. **Input Panel** - Set operands (scale + poles), operation, configuration
2. **Execute** - Run operation with full tracing
3. **Result Panel** - View result in all export formats
4. **Trace Timeline** - Explore step-by-step execution with collapsible events

### Batch Test Runner
1. **Run All Tests** - Execute full 15+ test suite
2. **View Results** - Pass/fail summary with detailed result table
3. **Export Results** - Download CSV or JSON for analysis

## API Usage Example

```typescript
import {
  SEN_SFP,
  SfpConfig,
  CONFIG_PRESET_SIMPLE,
  add,
  mul,
  CollectingTracer,
  exportAll
} from "@/sen";

// Create operands
const a: SEN_SFP = {
  special: "NORMAL",
  sign: 1, // POS
  scale: 0,
  mant: {
    digits: [
      { axis: "X", pole: 1 },  // +X
      { axis: "Y", pole: 1 },  // +Y
      { axis: "Z", pole: 1 },  // +Z
    ]
  },
  flags: { inexact: false, overflow: false, ... }
};

const b: SEN_SFP = { ... }; // 2nd operand

// Execute with tracing
const tracer = new CollectingTracer();
const result = add(a, b, CONFIG_PRESET_SIMPLE, tracer);

// Export in all formats
const exports = exportAll(result, CONFIG_PRESET_SIMPLE);
console.log(exports.sen_json);
console.log(exports.scalar_decimal);
console.log(exports.pole_string);

// Access trace events
tracer.getEvents().forEach(ev => {
  console.log(`[${ev.phase}] ${ev.message}`);
});
```

## Navigation

Access the SEN-SFP Explorer from the bottom menu bar (purple "SEN-SFP Explorer" button), which replaces the current system selector and provides access to:
- Interactive calculator
- Batch test runner
- Full result export capabilities

## Implementation Notes

### Determinism
- All operations are fully deterministic
- Stochastic rounding uses seed-based hashing for reproducibility
- No floating-point operations (uses integer poles and BigInt)

### Modularity
- Core arithmetic is pure (no I/O, no state)
- Tracing is optional (NullTracer by default)
- Exports are canonical and stable
- Tests are self-contained and reproducible

### Performance
- Optimized for correctness and transparency, not raw speed
- Suitable for educational/exploration use
- Scalable to larger precision via configuration

## Testing

Run the test suite directly in the UI:
1. Click "Test Suite" tab
2. Click "Run All Tests"
3. View results with inline pass/fail indicators
4. Export to CSV or JSON for comparison/analysis

Each test:
- Has a descriptive name and operation type
- Covers specific algorithm behaviors (cancellation, carries, rounding, etc.)
- Produces complete trace events
- Generates all standard exports
- Reports pass/fail status

## Future Enhancements

- IEEE-754 comparison mode (side-by-side with float/double)
- Property-based testing (commutativity, associativity, monotonicity)
- Performance profiling and optimization
- Extended precision arbitrary-length support
- Visualization of mantissa operations

## License

Part of FloatPointAlt project.
