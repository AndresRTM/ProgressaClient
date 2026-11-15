
import api from '../../services/api'
import { activityNameKey } from '../activities/activityCatalog'
import { getDefaultCalendarId } from './calendarApi'
import { createGoalActivity, getGoalActivities } from './goalsApi'

// Delete a planned workout
export async function deletePlannedSession(id) {
  await api.delete(`activity-sessions/${id}`)
}

// Create a planned workout
export async function createPlannedSession(session) {
  const { data } = await api.post(
    'activity-sessions/planned',
    session
  )

  return data
}

// Update a planned workout
export async function updatePlannedSession(id, session) {
  const { data } = await api.put(
    `activity-sessions/${id}`,
    session
  )

  return data
}

// Build the data for a new planned workout
export async function buildPlannedSession(activity, sportName) {
  const scheduledAt = new Date(
    `${activity.date}T${activity.time}`
  )

  if (
    !Number.isFinite(scheduledAt.getTime()) ||
    scheduledAt <= new Date()
  ) {
    throw new Error(
      'Choose a date and time in the future.'
    )
  }

  const categories = await getGoalActivities()
  const existingCategory = categories.find(
    (category) =>
      activityNameKey(category.name) ===
      activityNameKey(sportName)
  )

  const category =
    existingCategory ??
    (await createGoalActivity(sportName))

  return {
    categoryId: category.id,
    scheduledAt: scheduledAt.toISOString(),
    plannedDurationInMinutes: activity.duration,
  }
}

// Build the data for updating a planned workout
export async function buildPlannedSessionChanges(
  activity,
  sportName
) {
  const session = await buildPlannedSession(
    activity,
    sportName
  )

  return {
    categoryId: session.categoryId,
    scheduledAt: session.scheduledAt,
    plannedDurationInMinutes:
      session.plannedDurationInMinutes,
  }
}

// Mark a planned workout as completed
export async function completePlannedSession(
  id,
  actualDurationInMinutes
) {
  await api.patch(
    `activity-sessions/${id}/complete`,
    {
      actualDurationInMinutes,
    }
  )
}
