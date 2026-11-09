import { useCallback, useRef, useState } from 'react'
import { useSports } from '../activities/useSports'
import { isLogDate, mergeDailyLog, normalizeDailyLogs } from '../logging/dailyLogData'
import { INITIAL_ACTIVITIES, INITIAL_GOALS, INTENSITY_PACES, NO_PACE } from './homeData'

const STORAGE_KEY = 'progressa:home:v1'
const GOAL_METRICS = new Set(['sessions', 'minutes', 'variety'])

function isActivity(value, activityTypes) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    Object.hasOwn(activityTypes, value.type) &&
    isLogDate(value.date) &&
    typeof value.time === 'string' &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value.time) &&
    Number.isInteger(value.duration) &&
    value.duration > 0 &&
    value.duration <= 1440 &&
    typeof value.pace === 'string' &&
    value.pace.length <= 80 &&
    (value.logged === undefined || typeof value.logged === 'boolean') &&
    (value.intensity === undefined ||
      value.intensity === null ||
      Object.hasOwn(INTENSITY_PACES, value.intensity))
  )
}

function isGoal(value, activityTypes) {
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
    Object.hasOwn(activityTypes, value.color) &&
    (value.activityType === undefined || Object.hasOwn(activityTypes, value.activityType))
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
    dailyLogs: {},
  }
}

function loadHomeData(activityTypes) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (
      stored?.version === 1 &&
      Array.isArray(stored.activities) &&
      stored.activities.every((activity) => isActivity(activity, activityTypes)) &&
      hasUniqueIds(stored.activities) &&
      Array.isArray(stored.goals) &&
      stored.goals.every((goal) => isGoal(goal, activityTypes)) &&
      hasUniqueIds(stored.goals) &&
      typeof stored.profileName === 'string' &&
      stored.profileName.trim().length > 0 &&
      stored.profileName.length <= 60
    ) {
      return {
        activities: stored.activities,
        goals: stored.goals,
        profileName: stored.profileName,
        dailyLogs: normalizeDailyLogs(stored.dailyLogs),
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
  const { activityTypes } = useSports()
  const [data, setData] = useState(() => loadHomeData(activityTypes))
  const currentData = useRef(data)
  const [dataError, setDataError] = useState(null)

  const updateData = useCallback((next) => {
    currentData.current = next
    setData(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...next }))
      setDataError(null)
    } catch {
      setDataError(
        'Your changes are available for this session, but could not be saved in this browser. Check site storage before leaving.',
      )
    }
  }, [])

  const addActivity = useCallback(
    (activity) => {
      if (!activity || typeof activity !== 'object') return null
      const nextActivity = {
        id: createId(),
        type: activity.type,
        date: activity.date,
        time: activity.time,
        duration: Number(activity.duration),
        pace: typeof activity.pace === 'string' ? activity.pace.trim() : INTENSITY_PACES.easy,
        ...(Object.hasOwn(activity, 'intensity') ? { intensity: activity.intensity } : {}),
      }
      if (!isActivity(nextActivity, activityTypes)) return null
      const current = currentData.current
      updateData({ ...current, activities: [...current.activities, nextActivity] })
      return nextActivity
    },
    [activityTypes, updateData],
  )

  const updateActivity = useCallback(
    (id, values) => {
      if (!values || typeof values !== 'object') return null
      const current = currentData.current
      const activity = current.activities.find((item) => item.id === id)
      if (!activity) return null

      const nextActivity = { ...activity }
      for (const field of ['type', 'date', 'time', 'intensity']) {
        if (Object.hasOwn(values, field)) nextActivity[field] = values[field]
      }
      if (Object.hasOwn(values, 'duration')) nextActivity.duration = Number(values.duration)
      if (Object.hasOwn(values, 'pace')) {
        nextActivity.pace = typeof values.pace === 'string' ? values.pace.trim() : values.pace
      } else if (Object.hasOwn(values, 'intensity')) {
        nextActivity.pace = INTENSITY_PACES[values.intensity] ?? NO_PACE
      }
      if (!isActivity(nextActivity, activityTypes)) return null

      updateData({
        ...current,
        activities: current.activities.map((item) => (item.id === id ? nextActivity : item)),
      })
      return nextActivity
    },
    [activityTypes, updateData],
  )

  const deleteActivity = useCallback(
    (id) => {
      const current = currentData.current
      const activity = current.activities.find((item) => item.id === id)
      if (!activity) return null
      updateData({ ...current, activities: current.activities.filter((item) => item.id !== id) })
      return { ...activity }
    },
    [updateData],
  )

  const restoreActivity = useCallback(
    (activity) => {
      if (!isActivity(activity, activityTypes)) return null
      const current = currentData.current
      if (current.activities.some((item) => item.id === activity.id)) return null
      const nextActivity = { ...activity }
      updateData({ ...current, activities: [...current.activities, nextActivity] })
      return nextActivity
    },
    [activityTypes, updateData],
  )

  const logWorkout = useCallback(
    (activity, plannedId) => {
      if (!activity || typeof activity !== 'object') return null
      const current = currentData.current
      const planned = plannedId ? current.activities.find((item) => item.id === plannedId) : null
      if (
        plannedId &&
        (!planned || planned.type !== activity.type || planned.date !== activity.date)
      )
        return null

      const intensity = activity.intensity ?? null
      if (intensity !== null && !Object.hasOwn(INTENSITY_PACES, intensity)) return null
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const nextActivity = {
        id: planned?.id ?? createId(),
        type: activity.type,
        date: activity.date,
        time: activity.time ?? planned?.time ?? currentTime,
        duration: Number(activity.duration),
        pace: INTENSITY_PACES[intensity] ?? NO_PACE,
        logged: true,
        intensity,
      }
      if (!isActivity(nextActivity, activityTypes)) return null

      const activities = planned
        ? current.activities.map((item) => (item.id === planned.id ? nextActivity : item))
        : [...current.activities, nextActivity]
      updateData({ ...current, activities })
      return nextActivity
    },
    [activityTypes, updateData],
  )

  const setActivityDone = useCallback(
    (id, done) => {
      if (typeof done !== 'boolean') return null
      const current = currentData.current
      const activity = current.activities.find((item) => item.id === id)
      if (!activity) return null
      const nextActivity = { ...activity, logged: done }
      updateData({
        ...current,
        activities: current.activities.map((item) => (item.id === id ? nextActivity : item)),
      })
      return nextActivity
    },
    [updateData],
  )

  const saveDailyLog = useCallback(
    (date, patch) => {
      if (!isLogDate(date)) return false
      const current = currentData.current
      const previous = current.dailyLogs[date]
      const log = mergeDailyLog(previous, patch)
      if (!log) return false
      if (
        !previous &&
        Object.keys(log.amounts).length === 0 &&
        Object.keys(log.checks).length === 0 &&
        !Object.hasOwn(log, 'sleepMinutes')
      )
        return true

      updateData({ ...current, dailyLogs: { ...current.dailyLogs, [date]: log } })
      return true
    },
    [updateData],
  )

  const addGoal = useCallback(
    (goal) => {
      const nextGoal = {
        id: createId(),
        title: typeof goal.title === 'string' ? goal.title.trim() : '',
        metric: goal.metric,
        target: Number(goal.target),
        color: goal.color ?? goal.activityType ?? 'strength',
        ...(goal.activityType ? { activityType: goal.activityType } : {}),
      }
      if (!isGoal(nextGoal, activityTypes)) return null
      const current = currentData.current
      updateData({ ...current, goals: [...current.goals, nextGoal] })
      return nextGoal
    },
    [activityTypes, updateData],
  )

  const updateProfile = useCallback(
    (name) => {
      const nextName = typeof name === 'string' ? name.trim() : ''
      if (!nextName || nextName.length > 60) return false
      updateData({ ...currentData.current, profileName: nextName })
      return true
    },
    [updateData],
  )

  return {
    ...data,
    dataError,
    addActivity,
    updateActivity,
    deleteActivity,
    restoreActivity,
    logWorkout,
    setActivityDone,
    saveDailyLog,
    addGoal,
    updateProfile,
  }
}
