import React, { useState } from 'react'
import { useNumeric } from '../../context/NumericContext'

function randArray(n, seed = 123) {
  const a = new Array(n)
  let s = seed
  for (let i = 0; i < n; i++) {
    // simple LCG
    s = (s * 1664525 + 1013904223) >>> 0
    a[i] = (s / 0xffffffff) * 2 - 1
  }
  return a
}

export default function DotProduct() {
  const { systems, selected } = useNumeric()
  const [len, setLen] = useState(256)
  const [runs, setRuns] = useState(10)
  const [result, setResult] = useState(null)

  function runOnce() {
    const backend = selected.implementation
    const a = randArray(len, 42)
    const b = randArray(len, 43)

    // reference (float64)
    const t0 = performance.now()
    let ref = 0
    for (let i = 0; i < len; i++) ref += a[i] * b[i]
    const tRef = performance.now() - t0

    // quantized: multiply each pair with quantize on product, then accumulate depending on accumulation mode
    const t1 = performance.now()
    let qsum = 0
    for (let i = 0; i < len; i++) {
      const p = backend.quantize(a[i] * b[i])
      if (backend.accumulation === 'widened') {
        qsum = qsum + p
      } else {
        qsum = backend.quantize(qsum + p)
      }
    }
    const tQuant = performance.now() - t1

    const absErr = Math.abs(qsum - ref)
    const relErr = Math.abs(absErr / (ref || 1))

    setResult({ ref, qsum, absErr, relErr, tRef, tQuant, len, backendName: selected.name })
  }

  async function runBench() {
    let accumRef = 0
    let accumQ = 0
    const tStart = performance.now()
    for (let i = 0; i < runs; i++) runOnce()
    const tTotal = performance.now() - tStart
    // last run stored in result state
    setResult(r => ({ ...r, runs, timeTotalMs: tTotal }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="space-y-8 w-full max-w-4xl">
        <div className="liquid-glass p-8 pb-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Dot-product microbenchmark</h2>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-700">Vector length: <span className="font-semibold">{len}</span></label>
              <input type="range" min="8" max="4096" step="8" value={len} onChange={e => setLen(Number(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Runs: <span className="font-semibold">{runs}</span></label>
              <input type="range" min="1" max="100" step="1" value={runs} onChange={e => setRuns(Number(e.target.value))} className="w-full mt-2" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Selected system</label>
              <div className="mt-2 font-medium text-gray-900">{selected.name}</div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={runOnce} className="btn-primary w-56 whitespace-nowrap">Run once</button>
            <button onClick={runBench} className="btn-ghost w-56 whitespace-nowrap">Run benchmark ({runs} runs)</button>
          </div>
        </div>

        <div className="card p-6">
          {result ? (
            <div className="space-y-2">
              <div>Backend: <span className="font-medium text-gray-900">{result.backendName}</span></div>
              <div>Vector length: {result.len}</div>
              <div>Reference (float64): <span className="font-mono text-gray-900">{result.ref.toExponential(6)}</span></div>
              <div>Quantized result: <span className="font-mono text-gray-900">{result.qsum.toExponential(6)}</span></div>
              <div>Absolute error: <span className="text-gray-900">{result.absErr.toExponential(6)}</span></div>
              <div>Relative error: <span className="text-gray-900">{result.relErr.toExponential(6)}</span></div>
              <div>Reference time: <span className="text-gray-900">{result.tRef?.toFixed(2)} ms</span></div>
              <div>Quantized time: <span className="text-gray-900">{result.tQuant?.toFixed(2)} ms</span></div>
              {result.timeTotalMs && <div>Total for {result.runs} runs: <span className="text-gray-900">{result.timeTotalMs.toFixed(2)} ms</span></div>}
            </div>
          ) : (
            <div className="text-gray-500">No result yet. Click Run once to execute the dot-product with the selected system.</div>
          )}
        </div>
      </div>
    </div>
  )
}
