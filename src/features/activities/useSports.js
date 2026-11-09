import { createContext, useContext } from 'react'

export const SportsContext = createContext(null)

export function useSports() {
  const context = useContext(SportsContext)
  if (!context) throw new Error('Use SportsProvider around activity screens.')
  return context
}
