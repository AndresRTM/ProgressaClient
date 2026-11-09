export const DAILY_AMOUNT_LIMITS = {
  calories: 20000,
  protein: 2000,
  carbs: 2000,
  fat: 2000,
}

export const KJ_PER_KCAL = 4.184

const CHECK_KEYS = [...Object.keys(DAILY_AMOUNT_LIMITS), 'sleep']

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isEmpty(value) {
  return value === undefined || value === null || value === ''
}

export function isLogDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function formatSleep(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0))
  const hours = Math.floor(total / 60)
  const remainder = total % 60
  if (!hours) return `${remainder} min`
  if (!remainder) return `${hours} h`
  return `${hours} h ${remainder} min`
}

export function emptyDailyLog() {
  return { amounts: {}, checks: {} }
}

function normalizeDailyLog(value) {
  if (!isRecord(value)) return null
  if (value.amounts !== undefined && !isRecord(value.amounts)) return null
  if (value.checks !== undefined && !isRecord(value.checks)) return null

  const log = emptyDailyLog()
  for (const [key, maximum] of Object.entries(DAILY_AMOUNT_LIMITS)) {
    const amount = value.amounts?.[key]
    if (isEmpty(amount)) continue
    if (!Number.isFinite(amount) || amount < 0 || amount > maximum) return null
    log.amounts[key] = amount
  }

  for (const key of CHECK_KEYS) {
    const checked = value.checks?.[key]
    if (isEmpty(checked)) continue
    if (typeof checked !== 'boolean') return null
    log.checks[key] = checked
  }

  if (!isEmpty(value.sleepMinutes)) {
    if (
      !Number.isInteger(value.sleepMinutes) ||
      value.sleepMinutes < 0 ||
      value.sleepMinutes > 1440
    )
      return null
    log.sleepMinutes = value.sleepMinutes
  }

  return log
}

export function mergeDailyLog(current, patch) {
  const previous = normalizeDailyLog(current ?? emptyDailyLog())
  const changes = normalizeDailyLog(patch)
  if (!previous || !changes) return null

  const next = {
    ...previous,
    amounts: { ...previous.amounts },
    checks: { ...previous.checks, ...changes.checks },
  }

  // Nutrition entries add to the day's totals; sleep records one night's duration.
  for (const [key, amount] of Object.entries(changes.amounts)) {
    const total = Math.round(((previous.amounts[key] ?? 0) + amount) * 100) / 100
    if (total > DAILY_AMOUNT_LIMITS[key]) return null
    next.amounts[key] = total
  }
  if (Object.hasOwn(changes, 'sleepMinutes')) next.sleepMinutes = changes.sleepMinutes

  return next
}

export function normalizeDailyLogs(value) {
  if (!isRecord(value)) return {}

  const logs = {}
  for (const [date, entry] of Object.entries(value)) {
    if (!isLogDate(date)) continue
    const log = normalizeDailyLog(entry)
    if (log) logs[date] = log
  }
  return logs
}
