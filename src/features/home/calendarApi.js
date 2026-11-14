
import api from '../../services/api'

function parseDate(dateString) {
  const [year, month, day] = dateString
    .split('-')
    .map(Number)

  return new Date(year, month - 1, day, 12)
}

function formatDate(date) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    date.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(dateString, days) {
  const date = parseDate(dateString)

  date.setDate(date.getDate() + days)

  return formatDate(date)
}

function getMonday(dateString) {
  const date = parseDate(dateString)

  const daysSinceMonday =
    (date.getDay() + 6) % 7

  date.setDate(
    date.getDate() - daysSinceMonday
  )

  return formatDate(date)
}

// Map ordinary calendar sessions
function mapCalendarSession(session) {
  const scheduledAt = new Date(session.scheduledAt)

  const isCompleted =
    session.status === 'Completed'

  return {
    id: session.id,
    categoryName: session.categoryName,

    date: scheduledAt.toLocaleDateString('sv-SE'),

    time: scheduledAt.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    }),

    duration: isCompleted
      ? session.actualDurationInMinutes ??
        session.plannedDurationInMinutes
      : session.plannedDurationInMinutes,

    logged: isCompleted,
    recurring: false,
  }
}

// Map recurring workout occurrences
function mapRecurringOccurrence(occurrence) {
  return {
    id: `recurring-${occurrence.scheduleId}-${occurrence.localDate}`,

    recurringScheduleId: occurrence.scheduleId,

    calendarId: occurrence.calendarId,
    categoryId: occurrence.categoryId,
    categoryName: occurrence.categoryName,

    date: occurrence.localDate,
    time: occurrence.localTime.slice(0, 5),

    duration: occurrence.durationInMinutes,

    logged: false,
    recurring: true,
  }
}

// Get ordinary and recurring workouts
export async function getCalendarWeek(date, signal) {
  const weekStart = getMonday(date)

  // The API excludes the end date.
  // Therefore, use the following Monday.
  const endDate = addDays(weekStart, 7)

  const [calendarResponse, recurringResponse] =
    await Promise.all([
      api.get('calendar/week', {
        params: {
          date: weekStart,
        },
        signal,
      }),

      api.get('recurring-workouts/occurrences', {
        params: {
          from: weekStart,
          to: endDate,
        },
        signal,
      }),
    ])

  return [
    ...calendarResponse.data.map(mapCalendarSession),

    ...recurringResponse.data.map(
      mapRecurringOccurrence
    ),
  ]
}

// Get the user's default calendar
export async function getDefaultCalendarId() {
  const { data } = await api.get('calendar/default')

  return data.calendarId
}
