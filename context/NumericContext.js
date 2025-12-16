import React, { createContext, useContext, useState } from 'react'
import { DefaultNumericSystems } from '../numeric/systems'
import { createBackend } from '../numeric/simulate'

const NumericContext = createContext()

export function NumericProvider({ children }) {
  const [selected, setSelected] = useState(DefaultNumericSystems[0])

  function updateSelectedParams(params) {
    // merge params into selected and create a new implementation
    const merged = { ...selected, ...params }
    const impl = createBackend(
      merged.name || selected.name,
      merged.exponentBits ?? selected.exponentBits,
      merged.mantissaBits ?? selected.mantissaBits,
      merged.roundingMode ?? selected.roundingMode ?? selected.roundingMode,
      merged.accumulation ?? selected.accumulation,
      merged.seed ?? selected.seed
    )
    setSelected({ ...merged, implementation: impl })
  }

  return (
    <NumericContext.Provider value={{ systems: DefaultNumericSystems, selected, setSelected, updateSelectedParams }}>
      {children}
    </NumericContext.Provider>
  )
}

export function useNumeric() {
  return useContext(NumericContext)
}
