import React, { useState } from 'react';

// Helper: convert a number to SEN-like bit fields (stub, replace with real SEN logic)
function toSENBits(value, exponentBits = 6, mantissaBits = 9) {
  // For demo: mimic IEEE, but with custom bit widths
  if (isNaN(value)) return { sign: 'NaN', exponent: '', mantissa: '' };
  let sign = value < 0 ? 1 : 0;
  let abs = Math.abs(value);
  let e = abs === 0 ? 0 : Math.floor(Math.log2(abs));
  let m = abs === 0 ? 0 : abs / Math.pow(2, e) - 1;
  let expMax = (1 << exponentBits) - 1;
  let bias = (1 << (exponentBits - 1)) - 1;
  let expField = e + bias;
  if (expField < 0) expField = 0;
  if (expField > expMax) expField = expMax;
  let mantField = Math.round(m * (1 << mantissaBits));
  if (mantField > (1 << mantissaBits) - 1) mantField = (1 << mantissaBits) - 1;
  return {
    sign: sign.toString(2),
    exponent: expField.toString(2).padStart(exponentBits, '0'),
    mantissa: mantField.toString(2).padStart(mantissaBits, '0'),
    e,
    m,
    bias,
    expField,
    mantField
  };
}

export default function SENBitVisualizer({ exponentBits = 6, mantissaBits = 9, colorScheme = 'default' }) {
  const [input, setInput] = useState('1.0');
  const [showDetails, setShowDetails] = useState(false);
  const value = parseFloat(input);
  const bits = toSENBits(value, exponentBits, mantissaBits);

  // Color classes for default (gray/indigo) or green
    const color = colorScheme === 'green' ? {
      heading: 'text-green-900',
      sub: 'text-green-800',
      box: 'bg-green-100/80 text-green-900',
      border: 'border-2 border-green-400',
      button: 'text-green-900 hover:text-green-800',
      details: 'text-green-900'
    } : {
      heading: 'text-[#1a1a1a]',
      sub: 'text-[#1a1a1a]',
      box: 'bg-slate-100/80 text-[#1a1a1a]',
      border: '',
      button: 'text-[#1a1a1a] hover:text-[#232946]',
      details: 'text-[#1a1a1a]'
    };

  return (
    <div className={`liquid-glass p-6 mb-4 flex flex-col items-start gap-2 ${color.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-bold text-lg ${color.heading}`}>SEN Bit Visualizer</span>
        <span className={`text-xs ${color.sub}`}>(Demo: not final SEN logic)</span>
      </div>
      <label className="text-sm text-[#232946] mb-1">Enter a number:</label>
      <input
        type="number"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="rounded p-2 text-gray-900 border border-gray-300 mb-2"
        style={{ width: 160 }}
      />
      <div className="flex flex-row gap-4 items-center mb-2">
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#232946]">Sign</span>
          <span className={`font-mono text-lg px-2 py-1 rounded ${color.box}`}>{bits.sign}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#232946]">Exponent</span>
          <span className={`font-mono text-lg px-2 py-1 rounded ${color.box}`}>{bits.exponent}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#232946]">Mantissa</span>
          <span className={`font-mono text-lg px-2 py-1 rounded ${color.box}`}>{bits.mantissa}</span>
        </div>
      </div>
      <button
        className={`text-xs underline mb-1 ${color.button}`}
        onClick={() => setShowDetails(v => !v)}
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>
      {showDetails && (
        <div className={`text-xs mt-1 ${color.details}`}>
          <div>Input: <span className="font-mono">{input}</span></div>
          <div>Sign: <span className="font-mono">{bits.sign}</span></div>
          <div>Exponent (raw): <span className="font-mono">{bits.e}</span></div>
          <div>Exponent (biased): <span className="font-mono">{bits.expField}</span> (bias={bits.bias})</div>
          <div>Mantissa (fractional): <span className="font-mono">{bits.m.toPrecision(6)}</span></div>
          <div>Mantissa (bits): <span className="font-mono">{bits.mantField}</span></div>
        </div>
      )}
    </div>
  );
}
