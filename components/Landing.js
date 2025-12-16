import React from 'react'
import Link from 'next/link'

export function Landing(){
  return (
    <div className="h-screen canvas-grid flex items-center justify-center px-6">
      <div className="max-w-4xl w-full text-center">
        <div className="liquid-glass p-10 pb-8 shadow-xl">
          <h1 className="text-4xl font-bold mb-4 text-[#232946] drop-shadow-sm">Numeric Systems Shape the Cost and Capability of AI</h1>
          <p className="text-lg text-[#232946] mb-8">Explore how modern ML arithmetic behaves — and where it breaks.</p>
          <div className="flex flex-row gap-4 justify-center items-center mb-8">
            <Link href="/fundamentals" passHref legacyBehavior>
              <a>
                <button type="button" className="btn-primary min-w-[140px] max-w-[180px] text-base text-center whitespace-nowrap flex justify-center items-center px-4 py-2 transition-all duration-200">Explore Benchmarks</button>
              </a>
            </Link>
            <Link href="/summary" passHref legacyBehavior>
              <a>
                <button type="button" className="btn-ghost min-w-[140px] max-w-[180px] text-base text-center whitespace-nowrap flex justify-center items-center px-4 py-2 transition-all duration-200">Technical Summary</button>
              </a>
            </Link>
          </div>
        </div>
        <div className="mt-12 text-left card p-8 rounded-2xl shadow-lg">
          <h3 className="font-semibold mb-2 text-[#232946]">Quick demo</h3>
          <p className="text-sm text-[#232946]">This is a scaffold containing the app structure, global numeric selector, a numeric module, and sample static benchmark data. Replace the placeholder visualizations with D3/WebGL graphs to complete the brief.</p>
        </div>
      </div>
    </div>
  )
}
