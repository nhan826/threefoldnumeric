import React, { useState } from "react";
import { RoundMode, CONFIG_PRESET_SIMPLE, Pole, Special, SEN_SFP, SenMantissa, SenDigit, Flags } from "../sen";
import { axisOfPosition } from "../sen";

export default function InputPanel({
  operandA,
  operandB,
  operation,
  config,
  onOperandAChange,
  onOperandBChange,
  onOperationChange,
  onConfigChange,
  onRun,
  isRunning,
}) {
  const [scaleA, setScaleA] = useState(0);
  const [scaleB, setScaleB] = useState(0);
  const [polesA, setPolesA] = useState("1,1,1,1");
  const [polesB, setPolesB] = useState("1,1,1,1");

  const updateOperandA = () => {
    const poleValues = polesA
      .split(",")
      .map((p) => (parseInt(p) > 0 ? Pole.POS : Pole.NEG));
    const digits = poleValues.map((pole, i) => 
      new SenDigit(axisOfPosition(i + 1), pole)
    );
    const mant = new SenMantissa(digits);
    const flags = new Flags();
    onOperandAChange(new SEN_SFP(Special.NORMAL, Pole.POS, scaleA, mant, flags));
  };

  const updateOperandB = () => {
    const poleValues = polesB
      .split(",")
      .map((p) => (parseInt(p) > 0 ? Pole.POS : Pole.NEG));
    const digits = poleValues.map((pole, i) => 
      new SenDigit(axisOfPosition(i + 1), pole)
    );
    const mant = new SenMantissa(digits);
    const flags = new Flags();
    onOperandBChange(new SEN_SFP(Special.NORMAL, Pole.POS, scaleB, mant, flags));
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl p-6 space-y-6 border border-slate-700 shadow-2xl">
      <div>
        <h2 className="text-xl font-bold text-blue-300 mb-6">⚙️ Configuration</h2>

        <div className="mb-5">
          <label className="block text-sm font-bold text-blue-200 mb-2 uppercase">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => onOperationChange(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-3 border-2 border-blue-500 focus:border-blue-400 focus:outline-none font-semibold text-base"
          >
            <option value="ADD">➕ Add (+)</option>
            <option value="SUB">➖ Subtract (-)</option>
            <option value="MUL">✖️ Multiply (×)</option>
            <option value="DIV">➗ Divide (÷)</option>
          </select>
        </div>

        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-blue-200 uppercase">
              Precision (P)
            </label>
            <span className="text-lg font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded">
              {config.P}
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="32"
            value={config.P}
            onChange={(e) =>
              onConfigChange({ ...config, P: parseInt(e.target.value) })
            }
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <label className="block text-xs font-bold text-green-300 mb-2 uppercase">
              E_MIN
            </label>
            <input
              type="number"
              value={config.E_MIN}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  E_MIN: parseInt(e.target.value),
                })
              }
              className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-2 border-2 border-green-600 focus:border-green-400 focus:outline-none font-bold"
            />
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <label className="block text-xs font-bold text-orange-300 mb-2 uppercase">
              E_MAX
            </label>
            <input
              type="number"
              value={config.E_MAX}
              onChange={(e) =>
                onConfigChange({
                  ...config,
                  E_MAX: parseInt(e.target.value),
                })
              }
              className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-2 border-2 border-orange-600 focus:border-orange-400 focus:outline-none font-bold"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-bold text-blue-200 mb-2 uppercase">
            Rounding Mode
          </label>
          <select
            value={config.ROUND_MODE}
            onChange={(e) =>
              onConfigChange({
                ...config,
                ROUND_MODE: e.target.value,
              })
            }
            className="w-full bg-slate-800 text-slate-100 rounded-lg px-4 py-3 border-2 border-blue-500 focus:border-blue-400 focus:outline-none font-semibold text-base"
          >
            <option value="NEAREST_EVEN">🎯 Nearest Even</option>
            <option value="TOWARD_ZERO">0️⃣ Toward Zero</option>
            <option value="UP">⬆️ Up</option>
            <option value="DOWN">⬇️ Down</option>
            <option value="STOCHASTIC">🎲 Stochastic</option>
          </select>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.SUBNORMAL}
            onChange={(e) =>
              onConfigChange({
                ...config,
                SUBNORMAL: e.target.checked,
              })
            }
            className="w-5 h-5 rounded cursor-pointer accent-purple-500"
          />
          <label className="text-sm font-semibold text-slate-200 cursor-pointer">
            Enable Subnormal Numbers
          </label>
        </div>
      </div>

      <div className="border-t-2 border-slate-700 pt-6">
        <h2 className="text-xl font-bold text-cyan-300 mb-6">📊 Operands</h2>

        <div className="mb-5">
          <div className="bg-cyan-900 border-l-4 border-cyan-400 rounded-lg p-3 mb-4">
            <label className="block text-sm font-bold text-cyan-200 uppercase">
              Operand A
            </label>
          </div>
          <div className="space-y-3 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div>
              <label className="text-xs text-slate-300 font-bold mb-2 block uppercase">Scale:</label>
              <input
                type="number"
                value={scaleA}
                onChange={(e) => setScaleA(parseInt(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-2 border-2 border-cyan-500 focus:border-cyan-400 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-bold mb-2 block uppercase">Poles:</label>
              <input
                type="text"
                value={polesA}
                onChange={(e) => setPolesA(e.target.value)}
                placeholder="1,-1,1,-1"
                className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-2 border-2 border-cyan-500 focus:border-cyan-400 focus:outline-none font-mono text-sm"
              />
              <div className="text-xs text-slate-400 mt-1">Use 1 for +, -1 for -</div>
            </div>
            <button
              onClick={updateOperandA}
              style={{
                backgroundColor: '#06b6d4',
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0891b2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#06b6d4'}
              className="rounded-lg transition"
            >
              ✓ Update A
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-purple-900 border-l-4 border-purple-400 rounded-lg p-3 mb-4">
            <label className="block text-sm font-bold text-purple-200 uppercase">
              Operand B
            </label>
          </div>
          <div className="space-y-3 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div>
              <label className="text-xs text-slate-300 font-bold mb-2 block uppercase">Scale:</label>
              <input
                type="number"
                value={scaleB}
                onChange={(e) => setScaleB(parseInt(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-2 border-2 border-purple-500 focus:border-purple-400 focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 font-bold mb-2 block uppercase">Poles:</label>
              <input
                type="text"
                value={polesB}
                onChange={(e) => setPolesB(e.target.value)}
                placeholder="1,-1,1,-1"
                className="w-full bg-slate-900 text-slate-100 rounded-lg px-3 py-2 border-2 border-purple-500 focus:border-purple-400 focus:outline-none font-mono text-sm"
              />
              <div className="text-xs text-slate-400 mt-1">Use 1 for +, -1 for -</div>
            </div>
            <button
              onClick={updateOperandB}
              style={{
                backgroundColor: '#a855f7',
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#9333ea'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#a855f7'}
              className="rounded-lg transition"
            >
              ✓ Update B
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={isRunning || !operandA || !operandB}
        style={{
          backgroundColor: isRunning || !operandA || !operandB ? '#475569' : '#2563eb',
          color: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: isRunning || !operandA || !operandB ? 'not-allowed' : 'pointer',
          width: '100%',
          transition: 'all 0.2s',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          opacity: isRunning || !operandA || !operandB ? 0.6 : 1
        }}
        onMouseOver={(e) => {
          if (!isRunning && operandA && operandB) {
            e.target.style.backgroundColor = '#1d4ed8';
          }
        }}
        onMouseOut={(e) => {
          if (!isRunning && operandA && operandB) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
      >
        {isRunning ? "⏳ Computing..." : "▶️ Calculate"}
      </button>
    </div>
  );
}
