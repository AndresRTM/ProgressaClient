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

export function formatMonthTitle(monthStart) {
  const [year, month] = monthStart.split('-').map(Number)
  return `${FULL_MONTHS[month - 1]} ${year}`
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

// mode 'month': only days inside the month are counted, so the bars add up to the month total.
// mode 'full': whole weeks are counted, even days in the neighbouring months.
export function buildWeeks(sessions, monthStart, weekStartsOn, mode, activityTypes) {
  const lastDay = dateAtOffset(addMonths(monthStart, 1), -1)
  const counted = mode === 'month' ? sessions.filter((session) => inMonth(session, monthStart)) : sessions
  const weeks = []

  for (
    let start = startOfWeek(monthStart, weekStartsOn);
    start <= lastDay;
    start = dateAtOffset(start, 7)
  ) {
    const summary = calculateSummary(counted, start, activityTypes)
    const values = Object.fromEntries(summary.byType.map((group) => [group.type, group.minutes]))
    // A short first week is labelled with its first day inside the month.
    const firstShownDay = mode === 'month' && start < monthStart ? monthStart : start

    weeks.push({
      start,
      label: formatShortDate(firstShownDay),
      totalMinutes: summary.totalMinutes,
      values,
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

export function compareValues(current, previous) {
  const difference = current - previous
  return {
    difference,
    percent: previous > 0 ? Math.round((difference / previous) * 100) : null,
    direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same',
  }
}
