// ...replaced with new implementation...
import React, { useContext, useState } from 'react';
import { useNumeric } from '../context/NumericContext';
import { useRouter } from 'next/router';
import { FaChevronDown } from 'react-icons/fa';

// Sidebar context for layout coordination
export const SidebarContext = React.createContext({ open: true, setOpen: () => {} });
export function useSidebar() { return useContext(SidebarContext); }

function GlobalControlsComponent() {
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
    <aside
      className={`fixed bottom-0 left-0 right-0 z-40 shadow-2xl rounded-t-3xl px-2 sm:px-6 pt-6 sm:pt-7 pb-4 flex flex-col items-stretch gap-4 transition-transform duration-500`}
      style={{
        backgroundColor: 'rgba(100, 116, 139, 0.75)',
        borderTop: '2px solid rgba(100, 116, 139, 1)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        minHeight: open ? 'auto' : '36px',
        transform: open ? 'translateY(0)' : 'translateY(calc(100% - 36px))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 1.5rem) + 0.5rem)',
        overflow: 'visible',
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
          {/* SEN-SFP Explorer Button */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => router.push('/sensfp')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 border-2 border-purple-400 whitespace-nowrap"
            >
              SEN-SFP Explorer
            </button>
          </div>
          {/* Second row: controls and buttons - responsive layout */}
          <div className="flex flex-col sm:flex-row flex-nowrap gap-3 sm:gap-2 items-stretch sm:items-end mt-2 min-w-0 overflow-hidden">
            <div className="flex-shrink-0 w-full sm:flex-1 sm:min-w-0">
              <label className="text-xs sm:text-sm text-slate-200 block font-bold">Rounding</label>
              <select
                value={rounding}
                onChange={e => setRounding(e.target.value)}
                style={{ backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#475569', borderWidth: '2px', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', fontWeight: 'bold' }}
                className="mt-1 w-full p-2 rounded text-sm border focus:outline-none focus:ring-2 appearance-none"
              >
                <option value="nearest" style={{backgroundColor: '#0f172a', color: '#f1f5f9', fontWeight: 'bold'}}>nearest</option>
                <option value="stochastic" style={{backgroundColor: '#0f172a', color: '#f1f5f9', fontWeight: 'bold'}}>stochastic</option>
              </select>
            </div>
            <div className="flex-shrink-0 w-full sm:flex-1 sm:min-w-0">
              <label className="text-xs sm:text-sm text-slate-200 block font-bold">Accum.</label>
              <select
                value={accumulation}
                onChange={e => setAccumulation(e.target.value)}
                style={{ backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#475569', borderWidth: '2px', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em', fontWeight: 'bold' }}
                className="mt-1 w-full p-2 rounded text-sm border focus:outline-none focus:ring-2 appearance-none"
              >
                <option value="same" style={{backgroundColor: '#0f172a', color: '#f1f5f9', fontWeight: 'bold'}}>same</option>
                <option value="widened" style={{backgroundColor: '#0f172a', color: '#f1f5f9', fontWeight: 'bold'}}>widened</option>
              </select>
            </div>
            <div className="flex-shrink-0 w-full sm:flex-1 sm:min-w-0">
              <label className="text-xs sm:text-sm text-slate-200 block font-bold">Seed</label>
              <input type="number" value={seed} onChange={e => setSeed(e.target.value)} style={{ backgroundColor: '#0f172a', color: '#f1f5f9', borderColor: '#475569', borderWidth: '2px', fontWeight: 'bold'}} className="mt-1 w-full p-2 rounded text-sm border placeholder-slate-300 focus:outline-none focus:ring-2" placeholder="e.g. 42" />
            </div>
            <div className="flex flex-row gap-2 sm:gap-2 items-end flex-shrink-0 w-full sm:w-auto sm:flex-shrink-0">
              <button type="button" onClick={apply} className="btn-primary flex-1 sm:flex-none text-xs sm:text-sm text-center whitespace-nowrap flex justify-center items-center px-3 py-2 transition-all duration-200">Apply</button>
              <button type="button" onClick={() => { setSeed(''); setRounding('nearest'); setAccumulation('same'); }} className="btn-ghost flex-1 sm:flex-none text-xs sm:text-sm text-center whitespace-nowrap flex justify-center items-center px-3 py-2 transition-all duration-200">Reset</button>
            </div>
          </div>
        </div>
      </aside>
    );
}

export default GlobalControlsComponent;
