// ...replaced with new implementation...
import React, { useContext, useState } from 'react';
import { useNumeric } from '../context/NumericContext';
import { useRouter } from 'next/router';
import { FaChevronDown } from 'react-icons/fa';

// Sidebar context for layout coordination
export const SidebarContext = React.createContext({ open: true, setOpen: () => {} });
export function useSidebar() { return useContext(SidebarContext); }

export default function GlobalControls() {
  const { open, setOpen } = useSidebar();
  const { systems, selected, setSelected, updateSelectedParams } = useNumeric();
  const router = useRouter();

  const [rounding, setRounding] = useState(selected.roundingMode || 'nearest');
  const [accumulation, setAccumulation] = useState(selected.accumulation || 'same');
  const [seed, setSeed] = useState(selected.seed ?? '');

  React.useEffect(() => {
    setRounding(selected.roundingMode || 'nearest');
    setAccumulation(selected.accumulation || 'same');
    setSeed(selected.seed ?? '');
  }, [selected]);

  function apply() {
    const seedVal = seed === '' ? null : Number(seed);
    updateSelectedParams({ roundingMode: rounding, accumulation, seed: seedVal });
  }

  return (
    <>
      {/* Bottom bar controls */}
      <aside
        className={`fixed left-0 right-0 mx-auto bottom-0 z-30 w-full sm:max-w-5xl md:max-w-7xl shadow-2xl rounded-none sm:rounded-t-3xl px-2 sm:px-6 pt-6 sm:pt-7 pb-4 flex flex-col items-stretch gap-4 transition-transform duration-500 will-change-transform overflow-visible`}
        style={{
          backgroundColor: 'rgba(100, 116, 139, 0.75)',
          borderTop: '1px solid rgba(71, 85, 105, 0.8)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          minHeight: open ? 'auto' : '36px',
          transform: open ? 'translateY(0)' : 'translateY(75%)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 1.5rem) + 0.5rem)',
        }}
      >
        {/* Arrow button centered on top border */}
        <div className="absolute left-0 right-0 flex justify-center" style={{top: '-22px'}}>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Hide controls bar' : 'Show controls bar'}
            className="bg-white border border-gray-300 rounded-full shadow-md p-2 flex items-center justify-center transition-transform duration-300"
            style={{transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s'}}
          >
            <FaChevronDown className="text-gray-600 text-lg" />
          </button>
        </div>
        {/* Controls: first row = system buttons, second row = rest */}
        <div className="flex flex-col gap-3 w-full mt-1">
          {/* Numeric system buttons */}
          <div className="flex flex-row gap-2 items-end flex-wrap justify-start">
            {(() => {
              const sen = systems.find(s => s.name === 'SEN');
              const rest = systems.filter(s => s.name !== 'SEN');
              return [sen, ...rest].map(s => {
                const isSEN = s.name === 'SEN';
                const isSelected = selected.name === s.name;
                let borderClass = '';
                if (isSelected) {
                  borderClass = isSEN
                    ? 'border-4 border-green-500 shadow-lg'
                    : 'border-4 border-blue-500 shadow-lg';
                } else {
                  borderClass = isSEN
                    ? 'border-2 border-green-200 hover:border-green-400'
                    : 'border-2 border-blue-200 hover:border-blue-400';
                }
                const baseClass = isSEN
                  ? (isSelected
                      ? 'shadow-lg'
                      : 'shadow-md')
                  : 'card text-[#232946]';
                return (
                  <button
                    key={s.name}
                    onClick={() => {
                      setSelected(s);
                      router.push(`/fundamentals?system=${encodeURIComponent(s.name)}`);
                    }}
                    className={`min-w-[120px] whitespace-nowrap text-left p-3 flex items-center gap-3 rounded-lg transition-all duration-200 focus:outline-none
                      ${isSEN
                        ? 'focus-visible:ring-4 focus-visible:ring-green-500 active:ring-4 active:ring-green-600 focus-visible:border-green-500 focus-visible:border-4'
                        : 'focus-visible:ring-4 focus-visible:ring-blue-500 active:ring-4 active:ring-blue-600 focus-visible:border-blue-500 focus-visible:border-4'}
                      ${baseClass} ${borderClass} ${!isSelected && !isSEN ? 'hover:translate-y-0.5' : ''}`}
                    style={isSEN ? {
                      backgroundColor: isSelected ? '#10b981' : '#06d6a0',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '1.08rem',
                      border: isSelected ? '2px solid #fff' : '1px solid #7ee8c1'
                    } : {fontWeight: 'normal'}}
                  >
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className={`text-xs mt-1 ${isSEN ? 'text-green-900' : 'text-gray-500'}`}>{s.bitWidth} bits  {s.implementation.name}</div>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
          {/* Second row: controls and buttons - responsive layout */}
          <div className="flex flex-col sm:flex-row flex-nowrap gap-3 sm:gap-2 items-stretch sm:items-end mt-2 min-w-0 overflow-hidden">
            <div className="flex-shrink-0 w-full sm:flex-1 sm:min-w-0">
              <label className="text-xs sm:text-sm text-slate-200 block">Rounding</label>
              <select
                value={rounding}
                onChange={e => setRounding(e.target.value)}
                style={{ backgroundColor: '#475569', color: 'white', borderColor: '#374151', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                className="mt-1 w-full p-2 rounded text-sm border focus:outline-none focus:ring-2 appearance-none"
              >
                <option value="nearest" style={{backgroundColor: '#475569', color: 'white'}}>nearest</option>
                <option value="stochastic" style={{backgroundColor: '#475569', color: 'white'}}>stochastic</option>
              </select>
            </div>
            <div className="flex-shrink-0 w-full sm:flex-1 sm:min-w-0">
              <label className="text-xs sm:text-sm text-slate-200 block">Accum.</label>
              <select
                value={accumulation}
                onChange={e => setAccumulation(e.target.value)}
                style={{ backgroundColor: '#475569', color: 'white', borderColor: '#374151', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                className="mt-1 w-full p-2 rounded text-sm border focus:outline-none focus:ring-2 appearance-none"
              >
                <option value="same" style={{backgroundColor: '#475569', color: 'white'}}>same</option>
                <option value="widened" style={{backgroundColor: '#475569', color: 'white'}}>widened</option>
              </select>
            </div>
            <div className="flex-shrink-0 w-full sm:flex-1 sm:min-w-0">
              <label className="text-xs sm:text-sm text-slate-200 block">Seed</label>
              <input type="number" value={seed} onChange={e => setSeed(e.target.value)} style={{ backgroundColor: '#475569', color: 'white', borderColor: '#374151'}} className="mt-1 w-full p-2 rounded text-sm border placeholder-gray-400 focus:outline-none focus:ring-2" placeholder="e.g. 42" />
            </div>
            <div className="flex flex-row gap-2 sm:gap-2 items-end flex-shrink-0 w-full sm:w-auto sm:flex-shrink-0">
              <button type="button" onClick={apply} className="btn-primary flex-1 sm:flex-none text-xs sm:text-sm text-center whitespace-nowrap flex justify-center items-center px-3 py-2 transition-all duration-200">Apply</button>
              <button type="button" onClick={() => { setSeed(''); setRounding('nearest'); setAccumulation('same'); }} className="btn-ghost flex-1 sm:flex-none text-xs sm:text-sm text-center whitespace-nowrap flex justify-center items-center px-3 py-2 transition-all duration-200">Reset</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
