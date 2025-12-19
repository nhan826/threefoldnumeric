import React from 'react'
import Link from 'next/link'

export function Landing(){
  return (
    <>
      <div className="min-h-screen canvas-grid flex items-center justify-center px-2 sm:px-6 overflow-visible pt-11 sm:pt-15">
        <div className="max-w-4xl w-full text-center">
          <div className="liquid-glass p-4 sm:p-10 pb-4 sm:pb-8 shadow-xl break-words">
            <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 text-[#232946] drop-shadow-sm">Numeric Systems Shape the Cost and Capability of AI</h1>
            <p className="text-sm sm:text-lg text-[#232946] mb-6 sm:mb-8">Explore how modern ML arithmetic behaves — and where it breaks.</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mb-4 sm:mb-6">
              <Link href="/fundamentals" passHref legacyBehavior>
                <a>
                  <button type="button" className="btn-primary w-full sm:w-auto min-w-[120px] text-xs sm:text-base text-center whitespace-nowrap flex justify-center items-center px-4 sm:px-6 py-2 sm:py-3 transition-all duration-200 active:scale-95">Explore Benchmarks</button>
                </a>
              </Link>
              <Link href="/summary" passHref legacyBehavior>
                <a>
                  <button type="button" className="btn-ghost w-full sm:w-auto min-w-[120px] text-xs sm:text-base text-center whitespace-nowrap flex justify-center items-center px-4 sm:px-6 py-2 sm:py-3 transition-all duration-200 active:scale-95">Technical Summary</button>
                </a>
              </Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-12 rounded-2xl shadow-lg max-w-full overflow-hidden">
            <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center overflow-hidden">
              <img src="/banner.png" alt="Banner" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="mt-6 sm:mt-12 text-left card p-3 sm:p-8 rounded-2xl shadow-lg max-w-full overflow-hidden">
            <h3 className="font-semibold mb-2 text-[#232946] text-sm sm:text-base">Quick demo</h3>
            <p className="text-xs sm:text-sm text-[#232946]">This is a scaffold containing the app structure, global numeric selector, a numeric module, and sample static benchmark data. Replace the placeholder visualizations with D3/WebGL graphs to complete the brief.</p>
          </div>
        </div>
      </div>
      <div className="h-40" />
    </>
  )
}
