import Link from 'next/link'

export default function Header(){
  return (
    <header className="fixed top-6 left-0 right-0 mx-auto z-50 bg-white/90 shadow-xl border border-slate-200/60 transition-all duration-500 rounded-full px-6 py-2 flex items-center justify-between max-w-4xl" style={{backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)'}}>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-2">
          <Link href="/" legacyBehavior>
            <a className="flex items-center group" style={{minWidth:140}}>
              <img src="/logo.svg" alt="Logo" width={180} height={44} className="transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-lg" style={{maxHeight:44, width:140, objectFit:'contain'}} />
            </a>
          </Link>
        </span>
      </div>
      <nav className="flex items-center gap-1">
        <Link href="/benchmarks" legacyBehavior>
          <a className="text-[#232946] hover:text-indigo-600 px-2 py-1 text-[1rem] font-normal transition-colors duration-300 whitespace-nowrap rounded-md focus:outline-none">Benchmarks</a>
        </Link>
        <Link href="/summary" legacyBehavior>
          <a className="text-[#232946] hover:text-indigo-600 px-2 py-1 text-[1rem] font-normal transition-colors duration-300 whitespace-nowrap rounded-md focus:outline-none">Technical Summary</a>
        </Link>
        <Link href="/howto" legacyBehavior>
          <a className="text-[#232946] hover:text-indigo-600 px-2 py-1 text-[1rem] font-normal transition-colors duration-300 whitespace-nowrap rounded-md focus:outline-none">How To Use</a>
        </Link>
      </nav>
    </header>
  )
}
