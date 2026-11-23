import { useEffect, useState } from 'react'
import api, { firstValidationError } from '../../services/api'
import { mergeDailyLog } from './dailyLogData'

export default function useDailyLog(date) {
  const [result, setResult] = useState(null)
  const [request, setRequest] = useState(0)
  const current = result && result.date === date && result.request === request ? result : null
  const path = `daily-logs/${date}`

  useEffect(() => {
    if (!date) return

    const controller = new AbortController()
    api.get(path, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setResult({ date, request, log: data })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ date, request, error: 'Could not load your daily log.' })
        }
      })

    return () => controller.abort()
  }, [date, path, request])

  async function save(patch) {
    if (!current?.log) throw new Error('Load your daily log before saving.')
    if (!Object.keys(patch.amounts).length && !Object.keys(patch.checks).length &&
        patch.sleepMinutes === undefined) return

    const log = mergeDailyLog(current.log, patch)
    if (!log) throw new Error('Check the amounts and the daily limits, then try again.')

    try {
      const { data } = await api.put(path, { ...log, version: current.log.version })
      setResult((previous) => previous === current ? { ...current, log: data } : previous)
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('This log changed. Close and reopen it to check your saved totals.')
      }
      throw new Error(firstValidationError(error) ?? 'Could not save your daily log. Please try again.')
    }
  }

  return {
    log: current?.log,
    loading: Boolean(date && !current),
    error: current?.error,
    reload: () => setRequest((value) => value + 1),
    save,
  }
}
