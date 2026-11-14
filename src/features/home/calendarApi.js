
import api from '../../services/api'

// Add days to a YYYY-MM-DD date.
function addDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number)

  const date = new Date(year, month - 1, day, 12)
  date.setDate(date.getDate() + days)

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}

// Convert a normal calendar session.
function mapCalendarSession(session) {
  const scheduledAt = new Date(session.scheduledAt)

  return {
    id: session.id,
    categoryName: session.categoryName,
    date: scheduledAt.toLocaleDateString('sv-SE'),
    time: scheduledAt.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: session.plannedDurationInMinutes,
    logged: session.status === 'Completed',
    recurring: false,
  }
}

// Convert a recurring workout occurrence.
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

// Get normal and recurring sessions for one week.
export async function getCalendarWeek(date, signal) {
  const endDate = addDays(date, 6)

  const [calendarResponse, recurringResponse] = await Promise.all([
    api.get('calendar/week', {
      params: { date },
      signal,
    }),
    api.get('recurring-workouts/occurrences', {
      params: {
        from: date,
        to: endDate,
      },
      signal,
    }),
  ])

  const normalSessions = calendarResponse.data.map(
    mapCalendarSession
  )

  const recurringSessions = recurringResponse.data.map(
    mapRecurringOccurrence
  )

  return [...normalSessions, ...recurringSessions]
}

// Get the user's default calendar.
export async function getDefaultCalendarId() {
  const { data } = await api.get('calendar/default')

  return data.calendarId
}
