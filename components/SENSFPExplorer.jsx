import React, { useState } from "react";
import InputPanel from "./SENInputPanel";
import ResultPanel from "./SENResultPanel";
import TraceTimeline from "./SENTraceTimeline";
import TestRunner from "./SENTestRunner";
import { CollectingTracer, CONFIG_PRESET_SIMPLE, add, sub, mul, div } from "../sen";

export default function SENSFPExplorer() {
  const [operandA, setOperandA] = useState(null);
  const [operandB, setOperandB] = useState(null);
  const [operation, setOperation] = useState("ADD");
  const [config, setConfig] = useState(CONFIG_PRESET_SIMPLE);
  const [result, setResult] = useState(null);
  const [traceEvents, setTraceEvents] = useState([]);
  const [showTests, setShowTests] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    console.log("handleRun called, operandA:", operandA, "operandB:", operandB);
    
    if (!operandA || !operandB) {
      alert("⚠️ Please set both operands by clicking Update A and Update B");
      console.log("Missing operands");
      return;
    }

    console.log("Operation:", operation, "Config:", config);
    
    setIsRunning(true);
    try {
      const tracer = new CollectingTracer();

      let res;
      console.log("Starting operation:", operation);
      switch (operation) {
        case "ADD":
          console.log("Calling add...");
          res = add(operandA, operandB, config, tracer);
          break;
        case "SUB":
          console.log("Calling sub...");
          res = sub(operandA, operandB, config, tracer);
          break;
        case "MUL":
          console.log("Calling mul...");
          res = mul(operandA, operandB, config, tracer);
          break;
        case "DIV":
          console.log("Calling div...");
          res = div(operandA, operandB, config, tracer);
          break;
        default:
          res = null;
      }

      if (!res) {
        alert("Error: Operation returned null result");
        console.error("Operation returned null");
        return;
      }

      console.log("Operation result:", res);
      console.log("Trace events:", tracer.getEvents());
      
      setResult(res);
      setTraceEvents(tracer.getEvents());
    } catch (error) {
      console.error("Operation error:", error);
      console.error("Stack:", error.stack);
      alert(`Error during calculation: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-5xl">🎯</div>
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                SEN-SFP Explorer
              </h1>
              <p className="text-lg text-slate-400 mt-1">
                Structure-preserving SEN Floating-Point Arithmetic Laboratory
              </p>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-full"></div>
        </div>

        {/* User Guide */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 mb-8 border border-slate-700 shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">📖 How to Use</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-slate-300">
            <div>
              <h3 className="font-bold text-blue-300 mb-2">Setup & Input:</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="text-cyan-400">• Operand A/B:</span> Enter comma-separated poles (1 for +, -1 for -)</li>
                <li><span className="text-cyan-400">• Scale:</span> The exponent value (integer)</li>
                <li><span className="text-cyan-400">• Click "Update A" and "Update B"</span> to set your operands</li>
                <li><span className="text-cyan-400">• Select Operation:</span> ADD, SUB, MUL, or DIV</li>
                <li><span className="text-cyan-400">• Click "Calculate"</span> to execute</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-purple-300 mb-2">Understanding Results:</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="text-cyan-400">• Special:</span> NORMAL, ZERO, INF, or NAN</li>
                <li><span className="text-cyan-400">• Scale:</span> Result exponent</li>
                <li><span className="text-cyan-400">• Poles:</span> Mantissa as +/- signs</li>
                <li><span className="text-cyan-400">• Axis+Poles:</span> Each digit with its axis (X/Y/Z)</li>
                <li><span className="text-cyan-400">• Scalar Decimal:</span> High-precision decimal approximation</li>
                <li><span className="text-cyan-400">• Flags:</span> inexact, overflow, underflow, rounded, subnormal, invalid</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-600">
            <p className="text-sm text-slate-400"><span className="text-yellow-300 font-bold">Example:</span> Poles "1,1,1,1" with scale 0 represents mantissa [+,+,+,+]. The scalar value ≈ 1×2⁰ + 1×2⁻¹ + 1×2⁻² + 1×2⁻³ = 1.875</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowTests(false)}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              !showTests
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <span>🧮</span> Interactive Calculator
          </button>
          <button
            onClick={() => setShowTests(true)}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
              showTests
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <span>🧪</span> Test Suite
          </button>
        </div>

        {/* Main Content */}
        {showTests ? (
          <TestRunner config={config} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Input Panel */}
            <div className="lg:col-span-1">
              <InputPanel
                operandA={operandA}
                operandB={operandB}
                operation={operation}
                config={config}
                onOperandAChange={setOperandA}
                onOperandBChange={setOperandB}
                onOperationChange={setOperation}
                onConfigChange={setConfig}
                onRun={handleRun}
                isRunning={isRunning}
              />
            </div>

            {/* Right Column - Results and Trace */}
            <div className="lg:col-span-2 space-y-8">
              {result && (
                <>
                  <ResultPanel result={result} config={config} />
                  <TraceTimeline events={traceEvents} />
                </>
              )}
              {!result && (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-12 text-center border-2 border-dashed border-slate-700 shadow-2xl">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-slate-400 text-lg mb-2">
                    Configure operands and click "Calculate" to see results
                  </p>
                  <p className="text-slate-500 text-sm">
                    Results, trace events, and detailed metrics will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-500 text-sm">
            SEN-SFP: Deterministic Arithmetic with Full Operational Tracing
          </p>
        </div>
      </div>
    </div>
  );
}
