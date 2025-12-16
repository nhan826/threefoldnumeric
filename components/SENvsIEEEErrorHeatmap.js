import React, { useMemo, useState } from 'react';
import { useNumeric } from '../context/NumericContext';

// Helper: get system by name
function getSystemByName(systems, name) {
  return systems.find(s => s.name === name);
}

// Compute relative error for a range of values
function computeRelError(system, values) {
  const { quantize } = system.implementation;
  return values.map(x => {
    const q = quantize(x);
    return Math.abs((q - x) / (x === 0 ? 1 : x));
  });
}

export default function SENvsIEEEErrorHeatmap() {
  const { systems } = useNumeric();
  const sen = getSystemByName(systems, 'SEN');
  const ieee = getSystemByName(systems, 'FP32');
  const [logMin, setLogMin] = useState(-3);
  const [logMax, setLogMax] = useState(3);
  const [steps, setSteps] = useState(100);

  // Generate values logarithmically spaced
  const values = useMemo(() => {
    const arr = [];
    for (let i = 0; i < steps; ++i) {
      const v = Math.pow(10, logMin + (logMax - logMin) * i / (steps - 1));
      arr.push(v);
    }
    return arr;
  }, [logMin, logMax, steps]);

  const senErr = useMemo(() => sen ? computeRelError(sen, values) : [], [sen, values]);
  const ieeeErr = useMemo(() => ieee ? computeRelError(ieee, values) : [], [ieee, values]);

  // Color scale: blue (low error) to red (high error)
  function errorToColor(err) {
    if (err === 0) return '#22d3ee';
    const t = Math.min(1, Math.log10(err + 1e-12) / 2 + 0.5); // log scale
    const r = Math.round(255 * t);
    const g = Math.round(200 * (1 - t));
    const b = Math.round(238 * (1 - t));
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="liquid-glass p-6 mt-8 shadow-xl w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">SEN vs IEEE (FP32) Relative Error Heatmap</h3>
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <label className="text-xs text-[#232946]">Log10 Min
          <input type="number" value={logMin} onChange={e => setLogMin(Number(e.target.value))} className="ml-2 w-16 p-1 rounded bg-white text-gray-900 border border-gray-300" />
        </label>
        <label className="text-xs text-[#232946]">Log10 Max
          <input type="number" value={logMax} onChange={e => setLogMax(Number(e.target.value))} className="ml-2 w-16 p-1 rounded bg-white text-gray-900 border border-gray-300" />
        </label>
        <label className="text-xs text-[#232946]">Steps
          <input type="number" value={steps} min={10} max={300} onChange={e => setSteps(Number(e.target.value))} className="ml-2 w-16 p-1 rounded bg-white text-gray-900 border border-gray-300" />
        </label>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#232946] mb-1">SEN Relative Error</span>
          <div className="flex flex-row items-end">
            {senErr.map((err, i) => (
              <div key={i} style={{height: 60, width: 3, background: errorToColor(err)}} title={`x=${values[i].toPrecision(3)}\nrel err=${err.toExponential(2)}`}></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-[#232946] mb-1">IEEE FP32 Relative Error</span>
          <div className="flex flex-row items-end">
            {ieeeErr.map((err, i) => (
              <div key={i} style={{height: 60, width: 3, background: errorToColor(err)}} title={`x=${values[i].toPrecision(3)}\nrel err=${err.toExponential(2)}`}></div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-xs text-[#232946] mt-4 text-center">Each bar shows the relative error for a value x (log scale). Blue = low error, red = high error. Adjust range and steps for more detail.</div>
    </div>
  );
}
