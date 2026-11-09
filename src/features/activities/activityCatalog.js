import { SPORTS } from '../settings/settingsData'

export const CUSTOM_ACTIVITY_STORAGE_KEY = 'progressa:custom-activities:v1'
export const MAX_ACTIVITY_NAME_LENGTH = 40

const CUSTOM_COLORS = ['#9bbdb3', '#c5b6dc', '#edb69b', '#a5c9e2', '#a9ca87', '#e7bbca']
const customIdPattern = /^custom-[a-z0-9-]{12,80}$/i

export function normalizeActivityName(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : ''
}

export function activityNameKey(value) {
  return normalizeActivityName(value).toLocaleLowerCase('en-GB')
}

export function makeCustomSport(id, label, color = CUSTOM_COLORS[0]) {
  return {
    id,
    label,
    description: 'Your activities',
    category: 'Your activities',
    icon: 'activity',
    color: CUSTOM_COLORS.includes(color) ? color : CUSTOM_COLORS[0],
    custom: true,
  }
}

export function loadCustomSports() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CUSTOM_ACTIVITY_STORAGE_KEY))
    if (stored?.version !== 1 || !Array.isArray(stored.sports)) return []

    const ids = new Set(SPORTS.map((sport) => sport.id))
    const builtinNames = new Set(SPORTS.map((sport) => activityNameKey(sport.label)))
    const sports = []
    for (const value of stored.sports) {
      const label = normalizeActivityName(value?.label)
      const nameKey = activityNameKey(label)
      if (
        typeof value?.id !== 'string' ||
        !customIdPattern.test(value.id) ||
        !label ||
        label.length > MAX_ACTIVITY_NAME_LENGTH ||
        ids.has(value.id) ||
        builtinNames.has(nameKey)
      )
        continue

      sports.push(makeCustomSport(value.id, label, value.color))
      ids.add(value.id)
    }
    return sports
  } catch {
    return []
  }
}

export function mergeCustomSports(current, stored) {
  const sports = new Map(current.map((sport) => [sport.id, sport]))
  for (const sport of stored) {
    if (!sports.has(sport.id)) sports.set(sport.id, sport)
  }
  return [...sports.values()]
}

export function persistCustomSports(sports) {
  window.localStorage.setItem(
    CUSTOM_ACTIVITY_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      sports: sports.map(({ id, label, color }) => ({ id, label, color })),
    }),
  )
}

export function createCustomSport(label, index) {
  const suffix =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  return makeCustomSport(`custom-${suffix}`, label, CUSTOM_COLORS[index % CUSTOM_COLORS.length])
}

export function activityTypesFromSports(sports) {
  return Object.fromEntries(
    sports.map(({ id, label, color, icon }) => [id, { label, color, icon }]),
  )
}
