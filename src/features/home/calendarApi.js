import api from '../../services/api'

export async function getCalendarWeek(date, signal) {
  const { data } = await api.get('calendar/week', {
    params: { date },
    signal,
  })

  return data.map((session) => {
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
    }
  })
}