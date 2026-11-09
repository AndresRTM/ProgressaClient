import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SPORTS } from '../settings/settingsData'
import { SportsContext } from './useSports'
import {
  activityNameKey,
  activityTypesFromSports,
  createCustomSport,
  CUSTOM_ACTIVITY_STORAGE_KEY,
  loadCustomSports,
  MAX_ACTIVITY_NAME_LENGTH,
  mergeCustomSports,
  normalizeActivityName,
  persistCustomSports,
} from './activityCatalog'

export function SportsProvider({ children }) {
  const [customSports, setCustomSports] = useState(loadCustomSports)
  const currentCustomSports = useRef(customSports)

  const syncCustomSports = useCallback((next) => {
    const current = currentCustomSports.current
    if (next.length === current.length && next.every((sport, index) => sport.id === current[index].id))
      return
    currentCustomSports.current = next
    setCustomSports(next)
  }, [])

  useEffect(() => {
    function syncStoredSports(event) {
      if (event.key !== CUSTOM_ACTIVITY_STORAGE_KEY && event.key !== null) return
      syncCustomSports(mergeCustomSports(currentCustomSports.current, loadCustomSports()))
    }
    window.addEventListener('storage', syncStoredSports)
    return () => window.removeEventListener('storage', syncStoredSports)
  }, [syncCustomSports])

  const createSport = useCallback((name) => {
    const label = normalizeActivityName(name)
    if (!label) return { sport: null, error: 'Enter a name for your activity.' }
    if (label.length > MAX_ACTIVITY_NAME_LENGTH) {
      return {
        sport: null,
        error: `Keep the activity name to ${MAX_ACTIVITY_NAME_LENGTH} characters or fewer.`,
      }
    }

    const current = mergeCustomSports(currentCustomSports.current, loadCustomSports())
    const existing = [...SPORTS, ...current].find(
      (sport) => activityNameKey(sport.label) === activityNameKey(label),
    )
    if (existing) {
      syncCustomSports(current)
      return { sport: existing }
    }

    const sport = createCustomSport(label, current.length)
    const next = [...current, sport]
    try {
      // Save the catalog before a workout can refer to its new activity ID.
      persistCustomSports(next)
    } catch {
      return {
        sport: null,
        error: 'This activity could not be saved. Check browser storage and try again.',
      }
    }
    syncCustomSports(next)
    return { sport }
  }, [syncCustomSports])

  const sports = useMemo(() => [...SPORTS, ...customSports], [customSports])
  const activityTypes = useMemo(() => activityTypesFromSports(sports), [sports])
  const value = useMemo(
    () => ({ sports, activityTypes, createSport }),
    [sports, activityTypes, createSport],
  )

  return <SportsContext.Provider value={value}>{children}</SportsContext.Provider>
}

