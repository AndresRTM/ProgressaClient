import { useCallback, useEffect, useState } from 'react'
import { ACTIVITY_TYPES, INITIAL_ACTIVITIES, INITIAL_GOALS, dateAtOffset } from './homeData'

const STORAGE_KEY = 'progressa:home:v1'
const GOAL_METRICS = new Set(['sessions', 'minutes', 'variety'])

function isDate(value) {
  try {
    return dateAtOffset(value, 0) === value
  } catch {
    return false
  }
}

function isActivity(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    Object.hasOwn(ACTIVITY_TYPES, value.type) &&
    isDate(value.date) &&
    typeof value.time === 'string' &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time) &&
    Number.isInteger(value.duration) &&
    value.duration > 0 &&
    value.duration <= 1440 &&
    typeof value.pace === 'string' &&
    value.pace.length <= 80
  )
}

function isGoal(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    value.title.length <= 100 &&
    GOAL_METRICS.has(value.metric) &&
    Number.isInteger(value.target) &&
    value.target > 0 &&
    Object.hasOwn(ACTIVITY_TYPES, value.color) &&
    (value.activityType === undefined || Object.hasOwn(ACTIVITY_TYPES, value.activityType))
  )
}

function hasUniqueIds(values) {
  return new Set(values.map((value) => value.id)).size === values.length
}

function initialData() {
  return {
    activities: INITIAL_ACTIVITIES.map((activity) => ({ ...activity })),
    goals: INITIAL_GOALS.map((goal) => ({ ...goal })),
    profileName: 'JL',
  }
}

function loadHomeData() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (
      stored?.version === 1 &&
      Array.isArray(stored.activities) &&
      stored.activities.every(isActivity) &&
      hasUniqueIds(stored.activities) &&
      Array.isArray(stored.goals) &&
      stored.goals.every(isGoal) &&
      hasUniqueIds(stored.goals) &&
      typeof stored.profileName === 'string' &&
      stored.profileName.trim().length > 0 &&
      stored.profileName.length <= 60
    ) {
      return {
        activities: stored.activities,
        goals: stored.goals,
        profileName: stored.profileName,
      }
    }
  } catch {
    // A fresh local demo also works when storage is unavailable or corrupted.
  }
  return initialData()
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function useHomeData() {
  const [data, setData] = useState(loadHomeData)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...data }))
    } catch {
      // Keep the current session usable if browser storage is disabled or full.
    }
  }, [data])

  const addActivity = useCallback((activity) => {
    const nextActivity = {
      id: createId(),
      type: activity.type,
      date: activity.date,
      time: activity.time,
      duration: Number(activity.duration),
      pace: typeof activity.pace === 'string' ? activity.pace.trim() : 'Easy pace',
    }
    if (!isActivity(nextActivity)) return null
    setData((current) => ({ ...current, activities: [...current.activities, nextActivity] }))
    return nextActivity
  }, [])

  const addGoal = useCallback((goal) => {
    const nextGoal = {
      id: createId(),
      title: typeof goal.title === 'string' ? goal.title.trim() : '',
      metric: goal.metric,
      target: Number(goal.target),
      color: goal.color ?? goal.activityType ?? 'strength',
      ...(goal.activityType ? { activityType: goal.activityType } : {}),
    }
    if (!isGoal(nextGoal)) return null
    setData((current) => ({ ...current, goals: [...current.goals, nextGoal] }))
    return nextGoal
  }, [])

  const updateProfile = useCallback((name) => {
    const nextName = typeof name === 'string' ? name.trim() : ''
    if (!nextName || nextName.length > 60) return false
    setData((current) => ({ ...current, profileName: nextName }))
    return true
  }, [])

  return { ...data, addActivity, addGoal, updateProfile }
}
