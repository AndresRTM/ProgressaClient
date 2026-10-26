import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS, SPORTS } from './settingsData'

const STORAGE_KEY = 'progressa:settings:v1'
const SPORT_IDS = new Set(SPORTS.map((sport) => sport.id))
const LOGGING_MODES = new Set(['off', 'amount', 'goal'])

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isBoolean(value) {
  return typeof value === 'boolean'
}

function isTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function isPositiveInteger(value, maximum) {
  return Number.isInteger(value) && value > 0 && value <= maximum
}

const UNIT_RULES = {
  distance: (value) => ['km', 'mi'].includes(value),
  weight: (value) => ['kg', 'lb'].includes(value),
  energy: (value) => ['kcal', 'kj'].includes(value),
  height: (value) => ['cm', 'ft'].includes(value),
  weekStart: (value) => ['mon', 'sun'].includes(value),
  timeFormat: (value) => ['24h', '12h'].includes(value),
}

const NOTIFICATION_RULES = {
  upcoming: isBoolean,
  reminderMinutes: (value) => [0, 5, 10, 15, 30, 60].includes(value),
  daily: isBoolean,
  dailyTime: isTime,
  weekly: isBoolean,
  weeklyDay: (value) => Number.isInteger(value) && value >= 0 && value <= 6,
  weeklyTime: isTime,
  goalReached: isBoolean,
  missed: isBoolean,
  missedTime: isTime,
  quietHours: isBoolean,
  quietFrom: isTime,
  quietTo: isTime,
}

const TARGET_RULES = {
  calories: (value) => isPositiveInteger(value, 20000),
  protein: (value) => isPositiveInteger(value, 2000),
  carbs: (value) => isPositiveInteger(value, 2000),
  fat: (value) => isPositiveInteger(value, 2000),
  sleep: (value) => isPositiveInteger(value, 1440),
}

function validUpdates(values, rules) {
  const updates = {}
  if (!isRecord(values)) return updates

  for (const [key, validate] of Object.entries(rules)) {
    if (Object.hasOwn(values, key) && validate(values[key])) {
      updates[key] = values[key]
    }
  }

  return updates
}

function favoriteSports(ids) {
  return [...new Set(ids.filter((id) => SPORT_IDS.has(id)))].slice(0, 6)
}

function initialSettings() {
  return {
    favoriteSports: [...DEFAULT_SETTINGS.favoriteSports],
    units: { ...DEFAULT_SETTINGS.units },
    notifications: { ...DEFAULT_SETTINGS.notifications },
    logging: { ...DEFAULT_SETTINGS.logging },
    targets: { ...DEFAULT_SETTINGS.targets },
  }
}

function loadSettings() {
  const defaults = initialSettings()

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (!isRecord(stored) || stored.version !== 1) return defaults

    const logging = { ...defaults.logging }
    if (isRecord(stored.logging)) {
      for (const key of Object.keys(logging)) {
        if (LOGGING_MODES.has(stored.logging[key])) logging[key] = stored.logging[key]
      }
    }

    return {
      favoriteSports: Array.isArray(stored.favoriteSports)
        ? favoriteSports(stored.favoriteSports)
        : defaults.favoriteSports,
      units: { ...defaults.units, ...validUpdates(stored.units, UNIT_RULES) },
      notifications: {
        ...defaults.notifications,
        ...validUpdates(stored.notifications, NOTIFICATION_RULES),
      },
      logging,
      targets: { ...defaults.targets, ...validUpdates(stored.targets, TARGET_RULES) },
    }
  } catch {
    // Use the defaults if browser storage is unavailable or contains invalid JSON.
    return defaults
  }
}

export default function useSettings() {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...settings }))
    } catch {
      // Changes still work for this session when storage is disabled or full.
    }
  }, [settings])

  const updateNotifications = useCallback((patch) => {
    const updates = validUpdates(patch, NOTIFICATION_RULES)
    if (Object.keys(updates).length === 0) return

    setSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, ...updates },
    }))
  }, [])

  const updateUnits = useCallback((patch) => {
    const updates = validUpdates(patch, UNIT_RULES)
    if (Object.keys(updates).length === 0) return

    setSettings((current) => ({ ...current, units: { ...current.units, ...updates } }))
  }, [])

  const updateLogging = useCallback((key, value) => {
    if (!Object.hasOwn(DEFAULT_SETTINGS.logging, key) || !LOGGING_MODES.has(value)) return

    setSettings((current) => ({ ...current, logging: { ...current.logging, [key]: value } }))
  }, [])

  const updateTarget = useCallback((key, value) => {
    if (!Object.hasOwn(TARGET_RULES, key) || !TARGET_RULES[key](value)) return

    setSettings((current) => ({ ...current, targets: { ...current.targets, [key]: value } }))
  }, [])

  const setFavoriteSports = useCallback(
    (ids) => {
      if (!Array.isArray(ids)) return

      const nextFavorites = favoriteSports(ids)
      setSettings((current) => ({ ...current, favoriteSports: nextFavorites }))
    },
    [],
  )

  return {
    settings,
    updateNotifications,
    updateUnits,
    updateLogging,
    updateTarget,
    setFavoriteSports,
  }
}
