import api from '../../services/api'

function mapSession(session) {
  const scheduledAt = new Date(session.scheduledAt)

  return {
    id: session.id,
    scheduledAtMs: scheduledAt.getTime(),
    categoryName: session.categoryName,
    date: scheduledAt.toLocaleDateString('sv-SE'),
    time: scheduledAt.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: session.status === 'Completed'
      ? session.actualDurationInMinutes ?? session.plannedDurationInMinutes
      : session.plannedDurationInMinutes,
    logged: session.status === 'Completed',
  }
}

export async function getCalendarWeek(date, signal) {
  const { data } = await api.get('calendar/week', {
    params: { date },
    signal,
  })

  return data.map(mapSession)
}

export async function getCalendarMonth(date, signal) {
  const { data } = await api.get('calendar/month', {
    params: { date },
    signal,
  })

  return data.map(mapSession)
}

export async function getPlannedSessionsForDay(date, signal) {
  const { data } = await api.get('calendar/day', {
    params: { date },
    signal,
  })

  return data.filter((session) => session.status === 'Planned')
}

export async function getDefaultCalendarId() {
  const { data } = await api.get('calendar/default')
  return data.calendarId;
}