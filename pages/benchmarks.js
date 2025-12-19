import React from 'react'
import BenchmarksTable from '../components/BenchmarksTable'

export default function Benchmarks() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-transparent pt-4 sm:pt-8 mb-40 px-2 sm:px-4 w-full">
      <div className="w-full max-w-6xl">
        <BenchmarksTable />
      </div>
    </div>
  )
}
