const MS_PER_DAY = 86400000

// The API sends dates like "2026-11-24T00:00:00", only the date part matters here.
function isoDate(value) {
  return value?.slice(0, 10)
}

function daysBetween(fromIso, toIso) {
  return Math.round((new Date(`${toIso}T12:00:00`) - new Date(`${fromIso}T12:00:00`)) / MS_PER_DAY)
}

export function isReached(goal) {
  return goal.isCompleted || (goal.target > 0 && goal.progress >= goal.target)
}

function hasEnded(goal, today) {
  const end = isoDate(goal.endDate)
  return Boolean(end) && end < today
}

export function splitGoals(goals, today) {
  const byEndDate = (a, b) => (a.endDate ?? '').localeCompare(b.endDate ?? '')
  const finished = goals.filter((goal) => isReached(goal) || hasEnded(goal, today))

  return {
    active: goals.filter((goal) => !finished.includes(goal)).sort(byEndDate),
    finished: finished.sort((a, b) => byEndDate(b, a)),
  }
}

export function statusLabel(goal, today) {
  if (isReached(goal)) return 'Reached'
  if (hasEnded(goal, today)) return 'Ended'

  const end = isoDate(goal.endDate)
  if (!end) return ''

  const days = daysBetween(today, end)
  if (days === 0) return 'Ends today'
  return days === 1 ? '1 day left' : `${days} days left`
}

export function formatPeriod(goal) {
  const start = isoDate(goal.startDate)
  const end = isoDate(goal.endDate)
  if (!start || !end) return ''

  const format = (iso) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${format(start)} – ${format(end)}`
}
