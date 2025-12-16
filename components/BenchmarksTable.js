import React, { useMemo } from 'react';
import { useNumeric } from '../context/NumericContext';

// Simulate a dot product benchmark for a given numeric system
function runDotProduct(system, len = 256) {
  const { quantize, multiply, accumulate } = system.implementation;
  let a = Array.from({ length: len }, (_, i) => quantize(i + 1));
  let b = Array.from({ length: len }, (_, i) => quantize(len - i));
  let sum = quantize(0);
  for (let i = 0; i < len; ++i) {
    sum = accumulate(sum, multiply(a[i], b[i]));
  }
  return sum;
}

// Simulate a matrix multiplication benchmark for a given numeric system
function runMatmul(system, N = 32) {
  const { quantize, multiply, accumulate } = system.implementation;
  let A = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => quantize((i + 1) * (j + 1))));
  let B = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => quantize((i + j + 2))));
  let C = Array.from({ length: N }, () => Array(N).fill(quantize(0)));
  for (let i = 0; i < N; ++i) {
    for (let j = 0; j < N; ++j) {
      let sum = quantize(0);
      for (let k = 0; k < N; ++k) {
        sum = accumulate(sum, multiply(A[i][k], B[k][j]));
      }
      C[i][j] = sum;
    }
  }
  // Return the sum of all elements as a simple scalar benchmark
  let total = quantize(0);
  for (let i = 0; i < N; ++i) for (let j = 0; j < N; ++j) total = accumulate(total, C[i][j]);
  return total;
}

// Simulate a 1D convolution benchmark for a given numeric system
function runConvolution(system, len = 256, kernelSize = 5) {
  const { quantize, multiply, accumulate } = system.implementation;
  let x = Array.from({ length: len }, (_, i) => quantize(Math.sin(i)));
  let k = Array.from({ length: kernelSize }, (_, i) => quantize(1 / kernelSize));
  let y = Array(len).fill(quantize(0));
  for (let i = 0; i < len; ++i) {
    let sum = quantize(0);
    for (let j = 0; j < kernelSize; ++j) {
      if (i - j >= 0) sum = accumulate(sum, multiply(x[i - j], k[j]));
    }
    y[i] = sum;
  }
  // Return the sum of all outputs as a simple scalar benchmark
  return y.reduce((acc, v) => accumulate(acc, v), quantize(0));
}

export default function BenchmarksTable() {
  const { systems } = useNumeric();
  // Memoize results for performance
  const results = useMemo(() => {
    return systems.map(system => ({
      name: system.name,
      dot: runDotProduct(system),
      matmul: runMatmul(system),
      conv: runConvolution(system),
    }));
  }, [systems]);

  return (
    <div className="liquid-glass p-6 shadow-xl w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#232946] text-center">ML Operation Benchmarks</h2>
      <table className="min-w-full text-sm text-[#232946]">
        <thead>
          <tr className="border-b border-indigo-400/30">
            <th className="px-4 py-2 text-left">System</th>
            <th className="px-4 py-2 text-center">Dot Product</th>
            <th className="px-4 py-2 text-center">Matmul</th>
            <th className="px-4 py-2 text-center">1D Convolution</th>
          </tr>
        </thead>
        <tbody>
          {results.map(row => (
            <tr key={row.name} className="border-b border-slate-400/10 hover:bg-indigo-900/10 transition">
              <td className="px-4 py-2 font-semibold text-indigo-700">{row.name}</td>
              <td className="px-4 py-2 text-center font-mono">{Number(row.dot).toPrecision(8)}</td>
              <td className="px-4 py-2 text-center font-mono">{Number(row.matmul).toPrecision(8)}</td>
              <td className="px-4 py-2 text-center font-mono">{Number(row.conv).toPrecision(8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-500 mt-4 text-center">All results are computed using the current backend logic for each system. Values are for demonstration and may not reflect real hardware.</div>
    </div>
  );
}
