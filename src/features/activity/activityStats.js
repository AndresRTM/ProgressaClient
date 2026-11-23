import { activityNameKey } from '../activities/activityCatalog'
import { calculateSummary, dateAtOffset, startOfWeek } from '../home/homeData'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function monthStartOf(isoDate) {
  return `${isoDate.slice(0, 7)}-01`
}

export function addMonths(isoDate, count) {
  const [year, month] = isoDate.split('-').map(Number)
  const index = year * 12 + (month - 1) + count
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}-01`
}

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatMonthName(monthStart) {
  return FULL_MONTHS[Number(monthStart.split('-')[1]) - 1]
}

export function formatMonthTitle(monthStart) {
  return `${formatMonthName(monthStart)} ${monthStart.split('-')[0]}`
}

function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split('-').map(Number)
  return `${day} ${SHORT_MONTHS[month - 1]}`
}

// Keeps only completed sessions and connects each one to one of the user's sports.
export function withSportTypes(sessions, activityTypes) {
  return sessions
    .filter((session) => session.logged)
    .map((session) => ({
      ...session,
      type: Object.keys(activityTypes).find(
        (key) => activityNameKey(activityTypes[key].label) === activityNameKey(session.categoryName),
      ),
    }))
}

function inMonth(session, monthStart) {
  return session.date >= monthStart && session.date < addMonths(monthStart, 1)
}

export function monthTotals(sessions, monthStart) {
  const counted = sessions.filter(
    (session) => inMonth(session, monthStart) && Number.isFinite(session.duration) && session.duration > 0,
  )

  return {
    totalMinutes: counted.reduce((total, session) => total + session.duration, 0),
    sessions: counted.length,
  }
}

// The week number belongs to the week's Thursday, like ISO weeks, so a week that
// starts in the previous month or year still gets the right number.
function weekNumber(thursday) {
  const [year, month, day] = thursday.split('-').map(Number)
  const dayOfYear = (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000
  return Math.ceil(dayOfYear / 7)
}

function formatRange(first, last) {
  if (first === last) return formatShortDate(first)
  return `${Number(first.split('-')[2])}–${formatShortDate(last)}`
}

// Only days inside the month are counted, so the bars add up to the month total.
export function buildWeeks(sessions, monthStart, weekStartsOn, activityTypes) {
  const lastDay = dateAtOffset(addMonths(monthStart, 1), -1)
  const counted = sessions.filter((session) => inMonth(session, monthStart))
  const weeks = []

  for (
    let start = startOfWeek(monthStart, weekStartsOn);
    start <= lastDay;
    start = dateAtOffset(start, 7)
  ) {
    const summary = calculateSummary(counted, start, activityTypes)
    const thursday = dateAtOffset(start, weekStartsOn === 'sun' ? 4 : 3)
    const firstShownDay = start < monthStart ? monthStart : start
    const lastShownDay = dateAtOffset(start, 6) > lastDay ? lastDay : dateAtOffset(start, 6)

    weeks.push({
      start,
      label: `W${weekNumber(thursday)}`,
      range: formatRange(firstShownDay, lastShownDay),
      totalMinutes: summary.totalMinutes,
      totalSessions: summary.sessions,
      minutes: Object.fromEntries(summary.byType.map((group) => [group.type, group.minutes])),
      sessions: Object.fromEntries(summary.byType.map((group) => [group.type, group.sessions])),
      groups: summary.byType,
    })
  }

  // Same sport order in every bar: first the user's sports, then unknown categories.
  const series = []
  for (const week of weeks) {
    for (const group of week.groups) {
      if (!series.some((item) => item.type === group.type)) {
        series.push({ type: group.type, label: group.label, color: group.color })
      }
    }
  }
  const order = Object.keys(activityTypes)
  series.sort((a, b) => {
    const first = order.indexOf(a.type)
    const second = order.indexOf(b.type)
    return (first === -1 ? order.length : first) - (second === -1 ? order.length : second)
  })

  return { weeks, series }
}

export function sportTotals(weeks, series) {
  return series.map((item) => {
    const groups = weeks.flatMap((week) => week.groups.filter((group) => group.type === item.type))
    return {
      ...item,
      sessions: groups.reduce((total, group) => total + group.sessions, 0),
      minutes: groups.reduce((total, group) => total + group.minutes, 0),
    }
  })
}

export function formatMinutes(minutes) {
  const total = Math.round(Math.abs(minutes))
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (!hours) return `${rest} min`
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function compareValues(current, previous) {
  const difference = current - previous
  return {
    difference,
    percent: previous > 0 ? Math.round((difference / previous) * 100) : null,
    direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same',
  }
}
