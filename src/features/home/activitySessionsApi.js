import api from '../../services/api'
import { activityNameKey } from '../activities/activityCatalog'
import { getDefaultCalendarId } from './calendarApi'
import { createGoalActivity, getGoalActivities } from './goalsApi'

export async function deletePlannedSession(id) {
    await api.delete(`activity-sessions/${id}`)
}

export async function createPlannedSession(session) {
    const { data } = await api.post('activity-sessions/planned', session)
    return data
}

export async function buildPlannedSessionChanges(activity, sportName) {
  const scheduledAt = new Date(`${activity.date}T${activity.time}`)

  if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt <= new Date()) {
    throw new Error('Choose a date and time in the future.')
  }

  const categories = await getGoalActivities()
  const existingCategory = categories.find(
    (category) => activityNameKey(category.name) === activityNameKey(sportName),
  )
  const category = existingCategory ?? (await createGoalActivity(sportName))

  return {
    categoryId: category.id,
    scheduledAt: scheduledAt.toISOString(),
    plannedDurationInMinutes: activity.duration,
  }
}

export async function buildPlannedSession(activity, sportName) {
  const calendarId = await getDefaultCalendarId()
  const changes = await buildPlannedSessionChanges(activity, sportName)
  return { calendarId, ...changes }
}

export async function completePlannedSession(id, actualDurationInMinutes) {
  await api.patch(`activity-sessions/${id}/complete`, {
    actualDurationInMinutes,
  })
}

export async function updatePlannedSession(id, changes) {
  await api.put(`activity-sessions/${id}`, changes)
}