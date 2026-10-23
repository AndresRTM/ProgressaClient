export const DEMO_TODAY = '2026-10-21'
export const INITIAL_WEEK_START = '2026-10-19'

export const ACTIVITY_TYPES = {
  running: { label: 'Running', color: '#edb69b', icon: 'run' },
  strength: { label: 'Strength', color: '#a9ca87', icon: 'strength' },
  swimming: { label: 'Swimming', color: '#a5c9e2', icon: 'swim' },
  cycling: { label: 'Cycling', color: '#d5ceac', icon: 'cycling' },
}

export const INITIAL_ACTIVITIES = [
  {
    id: 'running-mon',
    type: 'running',
    date: '2026-10-19',
    time: '07:00',
    duration: 40,
    pace: 'Easy pace',
  },
  {
    id: 'strength-tue',
    type: 'strength',
    date: '2026-10-20',
    time: '18:00',
    duration: 40,
    pace: 'Steady pace',
  },
  {
    id: 'swimming-wed',
    type: 'swimming',
    date: '2026-10-21',
    time: '17:30',
    duration: 40,
    pace: 'Easy pace',
  },
  {
    id: 'running-fri',
    type: 'running',
    date: '2026-10-23',
    time: '07:00',
    duration: 30,
    pace: 'Easy pace',
  },
  {
    id: 'strength-fri',
    type: 'strength',
    date: '2026-10-23',
    time: '18:00',
    duration: 40,
    pace: 'Steady pace',
  },
  {
    id: 'cycling-sat',
    type: 'cycling',
    date: '2026-10-24',
    time: '09:00',
    duration: 30,
    pace: 'Easy pace',
  },
]

export const INITIAL_GOALS = [
  {
    id: 'running',
    title: 'Run 3 times',
    metric: 'sessions',
    activityType: 'running',
    target: 3,
    color: 'running',
  },
  { id: 'movement', title: 'Move 5 hours', metric: 'minutes', target: 300, color: 'strength' },
  { id: 'variety', title: 'Try 4 activities', metric: 'variety', target: 4, color: 'swimming' },
]

const shortWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
const longWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' })
const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long' })

function parseDate(isoDate) {
  if (typeof isoDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new RangeError('Use a calendar date in YYYY-MM-DD format.')
  }

  const [year, month, day] = isoDate.split('-').map(Number)
  // Noon stays on the intended calendar day across daylight-saving changes.
  const date = new Date(year, month - 1, day, 12)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new RangeError('Use a valid calendar date.')
  }
  return date
}

function toISODate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0))
  const hours = Math.floor(total / 60)
  const remainder = total % 60
  if (!hours) return `${remainder}m`
  return `${hours}h${remainder ? `${remainder}m` : ''}`
}

export function dateAtOffset(isoDate, offset) {
  const date = parseDate(isoDate)
  date.setDate(date.getDate() + offset)
  return toISODate(date)
}

export function formatWeekRange(start) {
  const first = parseDate(start)
  const last = parseDate(dateAtOffset(start, 6))
  if (first.getFullYear() !== last.getFullYear()) {
    return `${first.getDate()} ${monthName.format(first)} ${first.getFullYear()}–${last.getDate()} ${monthName.format(last)} ${last.getFullYear()}`
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${first.getDate()} ${monthName.format(first)}–${last.getDate()} ${monthName.format(last)}`
  }
  return `${first.getDate()}–${last.getDate()} ${monthName.format(last)}`
}

export function weekDays(start) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = dateAtOffset(start, index)
    const calendarDate = parseDate(date)
    return {
      date,
      day: shortWeekday.format(calendarDate),
      dayNumber: calendarDate.getDate(),
      longDay: longWeekday.format(calendarDate),
    }
  })
}

export function calculateSummary(activities, start) {
  const end = dateAtOffset(start, 7)
  const weekActivities = activities.filter(
    (activity) =>
      activity.date >= start &&
      activity.date < end &&
      Object.hasOwn(ACTIVITY_TYPES, activity.type) &&
      Number.isFinite(activity.duration) &&
      activity.duration > 0,
  )
  const byType = Object.entries(ACTIVITY_TYPES).map(([type, details]) => {
    const matching = weekActivities.filter((activity) => activity.type === type)
    return {
      type,
      ...details,
      minutes: matching.reduce((total, activity) => total + activity.duration, 0),
      sessions: matching.length,
    }
  })

  return {
    totalMinutes: byType.reduce((total, activity) => total + activity.minutes, 0),
    sessions: weekActivities.length,
    byType,
    uniqueTypes: byType.filter((activity) => activity.sessions > 0).length,
  }
}

export function goalProgress(goal, summary) {
  const matchingType = summary.byType.find((activity) => activity.type === goal.activityType)
  let current
  if (goal.metric === 'minutes') {
    current = goal.activityType ? (matchingType?.minutes ?? 0) : summary.totalMinutes
  } else if (goal.metric === 'variety') {
    current = summary.uniqueTypes
  } else {
    current = goal.activityType ? (matchingType?.sessions ?? 0) : summary.sessions
  }

  return {
    current,
    target: goal.target,
    valueLabel:
      goal.metric === 'minutes'
        ? `${formatDuration(current)}/${formatDuration(goal.target)}`
        : `${current}/${goal.target}`,
    percent: goal.target > 0 ? Math.min(100, Math.max(0, (current / goal.target) * 100)) : 0,
  }
}
