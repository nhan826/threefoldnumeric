import React, { useMemo, useState } from 'react';
import { useNumeric } from '../context/NumericContext';

function getSystemByName(systems, name) {
  return systems.find(s => s.name === name);
}

function getPrecision(system, x) {
  const { quantize } = system.implementation;
  const q = quantize(x);
  return Math.abs(q - x);
}

export default function SENRangePrecisionExplorer() {
  const { systems } = useNumeric();
  const sen = getSystemByName(systems, 'SEN');
  const ieee = getSystemByName(systems, 'FP32');
  const [logMin, setLogMin] = useState(-6);
  const [logMax, setLogMax] = useState(6);
  const [steps, setSteps] = useState(120);
  const [selected, setSelected] = useState('precision');

  const values = useMemo(() => {
    const arr = [];
    for (let i = 0; i < steps; ++i) {
      arr.push(Math.pow(10, logMin + (logMax - logMin) * i / (steps - 1)));
    }
    return arr;
  }, [logMin, logMax, steps]);

  const senData = useMemo(() => sen ? values.map(x => getPrecision(sen, x)) : [], [sen, values]);
  const ieeeData = useMemo(() => ieee ? values.map(x => getPrecision(ieee, x)) : [], [ieee, values]);

  // Color scale: green (SEN better), red (IEEE better), gray (equal)
  function diffToColor(senVal, ieeeVal) {
    if (senVal < ieeeVal) return '#22c55e';
    if (senVal > ieeeVal) return '#ef4444';
    return '#a3a3a3';
  }

  return (
    <div className="liquid-glass p-6 mt-8 shadow-xl w-full max-w-4xl mx-auto">
      <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">Range & Precision Explorer</h3>
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
        <select value={selected} onChange={e => setSelected(e.target.value)} className="ml-4 p-1 rounded bg-white text-gray-900 border border-gray-300">
          <option value="precision">Precision (|q-x|)</option>
        </select>
      </div>
      <div className="flex flex-row items-end gap-1 h-32">
        {values.map((x, i) => (
          <div key={i} style={{height: '100%', width: 3, background: diffToColor(senData[i], ieeeData[i])}} title={`x=${x.toExponential(2)}\nSEN: ${senData[i].toExponential(2)}\nIEEE: ${ieeeData[i].toExponential(2)}`}></div>
        ))}
      </div>
      <div className="flex flex-row justify-between text-xs text-[#232946] mt-2">
        <span>10^{logMin}</span>
        <span>10^{logMax}</span>
      </div>
      <div className="text-xs text-[#232946] mt-4 text-center">Green: SEN more precise, Red: IEEE more precise, Gray: equal. Adjust range for more detail.</div>
    </div>
  );
}
