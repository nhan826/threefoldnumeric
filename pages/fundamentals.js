import React, { useState, useEffect } from 'react'
import RelativeErrorChart from '../components/RelativeErrorChart'
import AccumulationErrorChart from '../components/AccumulationErrorChart'
import { useNumeric } from '../context/NumericContext'
import OverflowUnderflowChart from '../components/OverflowUnderflowChart'
import SENBitVisualizer from '../components/SENBitVisualizer'
import SENvsIEEEErrorHeatmap from '../components/SENvsIEEEErrorHeatmap'
import SENRangePrecisionExplorer from '../components/SENRangePrecisionExplorer'
import SENStepByStepAnimation from '../components/SENStepByStepAnimation'

export default function Fundamentals(){
  const { selected, updateSelectedParams } = useNumeric()
  const [mantissa, setMantissa] = useState(selected.mantissaBits || 10)
  const [rounding, setRounding] = useState(selected.roundingMode || 'nearest')
  const [accum, setAccum] = useState(selected.accumulation || 'same')

  useEffect(() => {
    // update when selected changes externally
    setMantissa(selected.mantissaBits)
    setRounding(selected.roundingMode || selected.roundingMode)
    setAccum(selected.accumulation)
  }, [selected])

  function applyParams() {
    updateSelectedParams({ mantissaBits: Number(mantissa), roundingMode: rounding, accumulation: accum, name: 'Custom' })
  }


  const isSEN = selected && selected.name === 'SEN';

  return (
    <div className="min-h-screen bg-[#f7f8fa] pt-6 sm:pt-12 px-2 sm:px-4 mb-40">
      <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full max-w-4xl mx-auto">
        <div className="liquid-glass p-3 sm:p-6 shadow-xl flex items-center gap-2 sm:gap-4 mb-2">
          {isSEN && <img src="/logo2.svg" alt="SEN Logo" width={32} height={32} className="drop-shadow flex-shrink-0 sm:w-[40px] sm:h-[40px]" />}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight break-words">
            {isSEN ? 'Threefold SEN Fundamentals' : `${selected.name} Fundamentals`}
          </h1>
        </div>
        {isSEN && <>
        <div className="card p-2 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <SENBitVisualizer exponentBits={6} mantissaBits={9} colorScheme="default" labelClass="text-[#1a1a1a] font-semibold" />
        </div>
        <div className="card p-2 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-[#1a1a1a]">SEN vs IEEE (FP32) Relative Error Heatmap</h2>
          <div className="w-full overflow-x-auto">
            <SENvsIEEEErrorHeatmap labelClass="text-[#1a1a1a] font-semibold" axisClass="text-[#232946] font-bold" descClass="text-[#232946]" />
          </div>
        </div>
        <div className="card p-2 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-[#1a1a1a]">Range & Precision Explorer</h2>
          <div className="w-full overflow-x-auto">
            <SENRangePrecisionExplorer labelClass="text-[#1a1a1a] font-semibold" axisClass="text-[#232946] font-bold" descClass="text-[#232946]" />
          </div>
        </div>
        <div className="card p-2 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-[#1a1a1a]">Step-by-Step: SEN vs IEEE Quantization</h2>
          <div className="w-full overflow-x-auto">
            <SENStepByStepAnimation labelClass="text-[#1a1a1a] font-semibold" axisClass="text-[#232946] font-bold" descClass="text-[#232946]" />
          </div>
        </div>
        </>}
        <div className="liquid-glass p-3 sm:p-8 pb-3 sm:pb-6 shadow-xl bg-white/95">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-[#1a1a1a]">Numeric Fundamentals</h2>
          <p className="text-sm sm:text-base text-[#232946] mb-4">Explore raw numeric behavior independent of ML. Use the floating panel to pick numeric systems, or create a custom configuration below.</p>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-end">
            <div>
              <label className="text-xs sm:text-sm text-[#1a1a1a]">Mantissa bits: <span className="font-semibold">{mantissa}</span></label>
              <input type="range" min="0" max="23" value={mantissa} onChange={e => setMantissa(e.target.value)} className="w-full mt-2 h-2 sm:h-2" />
            </div>
            <div>
              <label className="text-xs sm:text-sm text-[#1a1a1a]">Rounding</label>
              <select
                value={rounding}
                onChange={e => setRounding(e.target.value)}
                className="mt-2 w-full p-2 sm:p-3 rounded bg-white text-[#1a1a1a] text-xs sm:text-sm border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
              >
                <option value="nearest" className="bg-white text-[#1a1a1a]">nearest</option>
                <option value="stochastic" className="bg-white text-[#1a1a1a]">stochastic</option>
              </select>
            </div>
            <div>
              <label className="text-xs sm:text-sm text-[#1a1a1a]">Accumulation</label>
              <select
                value={accum}
                onChange={e => setAccum(e.target.value)}
                className="mt-2 w-full p-2 sm:p-3 rounded bg-white text-[#1a1a1a] text-xs sm:text-sm border border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
              >
                <option value="same" className="bg-white text-[#1a1a1a]">same</option>
                <option value="widened" className="bg-white text-[#1a1a1a]">widened</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
            <button onClick={applyParams} className="btn-primary min-w-[100px] text-xs sm:text-base text-center whitespace-nowrap flex justify-center items-center px-3 py-2 sm:py-3">Apply Custom</button>
            <div className="text-xs sm:text-sm text-[#1a1a1a] pt-2">Current: <span className="font-medium text-[#1a1a1a]">{selected.name}</span></div>
          </div>
        </div>
        <div className="card p-3 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <div className="w-full min-h-[250px] sm:min-h-[320px]">
            <RelativeErrorChart width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 768) : 600} height={280} />
          </div>
        </div>
        <div className="card p-3 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <div className="w-full min-h-[250px] sm:min-h-[320px]">
            <AccumulationErrorChart width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 768) : 600} height={280} />
          </div>
        </div>
        <div className="card p-3 sm:p-6 mb-4 sm:mb-8 max-w-4xl w-full mx-auto bg-white/95 overflow-hidden">
          <div className="w-full min-h-[250px] sm:min-h-[320px]">
            <OverflowUnderflowChart width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 768) : 600} height={280} system={{
              name: selected.name,
              min: selected.implementation?.minValue ?? 1e-38,
              max: selected.implementation?.maxValue ?? 1e38
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

