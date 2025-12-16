import React, { useState } from 'react';
import { useNumeric } from '../context/NumericContext';

function getSystemByName(systems, name) {
  return systems.find(s => s.name === name);
}

export default function SENStepByStepAnimation() {
  const { systems } = useNumeric();
  const sen = getSystemByName(systems, 'SEN');
  const ieee = getSystemByName(systems, 'FP32');
  const [x, setX] = useState(1.2345);
  const [step, setStep] = useState(0);

  // Steps: 0 = input, 1 = quantize SEN, 2 = quantize IEEE, 3 = compare
  const steps = [
    'Input Value',
    'SEN Quantization',
    'IEEE Quantization',
    'Comparison',
  ];

  let senQ = null, ieeeQ = null;
  if (sen) senQ = sen.implementation.quantize(x);
  if (ieee) ieeeQ = ieee.implementation.quantize(x);

  return (
    <div className="liquid-glass p-6 mt-8 shadow-xl w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-2 text-indigo-200">Step-by-Step: SEN vs IEEE Quantization</h3>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs text-gray-200">Input Value
          <input type="number" value={x} step="0.0001" onChange={e => setX(Number(e.target.value))} className="ml-2 w-32 p-1 rounded bg-white text-gray-900 border border-gray-300" />
        </label>
      </div>
      <div className="flex flex-row gap-2 mb-4">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} className={`px-3 py-1 rounded border ${step === i ? 'border-green-400 bg-green-900/30 text-green-200' : 'border-gray-500 bg-gray-800/30 text-gray-300'} transition`}>{s}</button>
        ))}
      </div>
      <div className="bg-gray-900/60 rounded p-4 min-h-[80px] text-lg text-indigo-100 font-mono">
        {step === 0 && <div>Input: <span className="text-yellow-200">{x}</span></div>}
        {step === 1 && sen && <div>SEN quantized: <span className="text-green-300">{senQ}</span><br/>Error: <span className="text-pink-300">{(senQ - x).toExponential(2)}</span></div>}
        {step === 2 && ieee && <div>IEEE quantized: <span className="text-blue-300">{ieeeQ}</span><br/>Error: <span className="text-pink-300">{(ieeeQ - x).toExponential(2)}</span></div>}
        {step === 3 && sen && ieee && <div>
          <div>SEN error: <span className="text-green-300">{Math.abs(senQ - x).toExponential(2)}</span></div>
          <div>IEEE error: <span className="text-blue-300">{Math.abs(ieeeQ - x).toExponential(2)}</span></div>
          <div className="mt-2">{Math.abs(senQ - x) < Math.abs(ieeeQ - x) ? <span className="text-green-400">SEN is more precise</span> : Math.abs(senQ - x) > Math.abs(ieeeQ - x) ? <span className="text-blue-400">IEEE is more precise</span> : <span className="text-gray-300">Equal precision</span>}</div>
        </div>}
      </div>
    </div>
  );
}
