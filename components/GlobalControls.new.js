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
        className={`fixed left-0 right-0 mx-auto bottom-0 z-30 max-w-4xl bg-white shadow-2xl border border-gray-200 rounded-t-3xl px-6 pt-7 pb-4 flex flex-col items-stretch gap-4 transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-[85%]'} overflow-visible`}
        style={{backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', minHeight: open ? 'auto' : '36px'}}
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
                    ? '!border-4 !border-green-400 shadow-lg'
                    : '!border-4 !border-indigo-400 shadow-lg';
                } else {
                  borderClass = isSEN ? 'border-2 border-green-600' : 'border border-transparent';
                }
                const baseClass = isSEN
                  ? (isSelected
                      ? 'bg-green-500/90 hover:bg-green-600 text-[#232946]'
                      : 'bg-green-100/90 hover:bg-green-200 text-[#232946]')
                  : 'card text-[#232946]';
                return (
                  <button
                    key={s.name}
                    onClick={() => {
                      setSelected(s);
                      router.push(`/fundamentals?system=${encodeURIComponent(s.name)}`);
                    }}
                    className={`min-w-[120px] whitespace-nowrap text-left p-3 flex items-center gap-3 rounded-lg transition-all duration-200
                      ${baseClass} ${borderClass} ${!isSelected && !isSEN ? 'hover:translate-y-0.5' : ''}`}
                    style={isSEN ? {fontWeight:'bold', fontSize:'1.08rem'} : {}}
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
          {/* Second row: controls and buttons */}
          <div className="flex flex-row flex-wrap gap-4 items-end mt-2">
            <div>
              <label className="text-xs text-black-300">Rounding</label>
              <select
                value={rounding}
                onChange={e => setRounding(e.target.value)}
                className="mt-1 w-full p-2 rounded text-sm bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="nearest" className="bg-white text-gray-900">nearest</option>
                <option value="stochastic" className="bg-white text-gray-900">stochastic</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-black-300">Accumulation</label>
              <select
                value={accumulation}
                onChange={e => setAccumulation(e.target.value)}
                className="mt-1 w-full p-2 rounded text-sm bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                style={{ backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="same" className="bg-white text-gray-900">same</option>
                <option value="widened" className="bg-white text-gray-900">widened</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-black-300">Seed (optional, for stochastic)</label>
              <input type="number" value={seed} onChange={e => setSeed(e.target.value)} className="mt-1 w-full p-2 rounded text-sm bg-white text-gray-900 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 42" />
            </div>
            {/* Always keep Apply and Reset on this row */}
            <div className="flex flex-row gap-2 items-end">
              <button type="button" onClick={apply} className="btn-primary min-w-[100px] max-w-[140px] text-base text-center whitespace-nowrap flex justify-center items-center">Apply</button>
              <button type="button" onClick={() => { setSeed(''); setRounding('nearest'); setAccumulation('same'); }} className="btn-ghost min-w-[100px] max-w-[140px] text-base text-center whitespace-nowrap flex justify-center items-center">Reset</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
