import Link from 'next/link'

export default function Header(){
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 shadow-xl border border-slate-200/60 transition-all duration-500 rounded-none sm:rounded-full px-2 sm:px-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 w-full sm:max-w-4xl sm:mx-auto sm:left-0 sm:right-0 h-auto sm:h-16 mt-0 sm:mt-3" style={{backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)', paddingTop: 'calc(env(safe-area-inset-top, 0.25rem) + 0.25rem)', paddingBottom: '0.25rem'}}>
      <div className="flex items-center justify-center sm:justify-start gap-4 h-full">
        {/* Logo */}
        <span className="inline-flex items-center gap-2 h-full">
          <Link href="/" legacyBehavior>
            <a className="flex items-center group h-full" style={{minWidth:'auto'}}>
              <img src="/logo.svg" alt="Logo" width={120} height={30} className="transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-lg" style={{maxHeight:30, width:'auto', objectFit:'contain'}} />
            </a>
          </Link>
        </span>
      </div>
      <nav className="flex flex-row items-center justify-center gap-1 sm:gap-1 flex-wrap h-full">
        <Link href="/benchmarks" legacyBehavior>
          <a className="text-[#232946] hover:text-indigo-600 px-2 sm:px-3 py-1 sm:py-2 text-[0.75rem] sm:text-[1rem] font-normal transition-colors duration-300 whitespace-nowrap rounded-md focus:outline-none active:scale-95 flex items-center h-full">Benchmarks</a>
        </Link>
        <Link href="/summary" legacyBehavior>
          <a className="text-[#232946] hover:text-indigo-600 px-2 sm:px-3 py-1 sm:py-2 text-[0.75rem] sm:text-[1rem] font-normal transition-colors duration-300 whitespace-nowrap rounded-md focus:outline-none active:scale-95 flex items-center h-full">Summary</a>
        </Link>
        <Link href="/howto" legacyBehavior>
          <a className="text-[#232946] hover:text-indigo-600 px-2 sm:px-3 py-1 sm:py-2 text-[0.75rem] sm:text-[1rem] font-normal transition-colors duration-300 whitespace-nowrap rounded-md focus:outline-none active:scale-95 flex items-center h-full">How To</a>
        </Link>
      </nav>
    </header>
  )
}
