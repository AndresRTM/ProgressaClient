import { useEffect, useState } from 'react'
import { getCalendarMonth } from '../home/calendarApi'
import { addMonths } from './activityStats'

// Fetches the selected month plus the one before and after it.
export default function useActivityMonth(month) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: '', sessions: [], failed: false })
  const key = `${month}:${attempt}`

  useEffect(() => {
    const controller = new AbortController()

    Promise.all(
      [-1, 0, 1].map((step) => getCalendarMonth(addMonths(month, step), controller.signal)),
    )
      .then((months) => {
        if (!controller.signal.aborted) setResult({ key, sessions: months.flat(), failed: false })
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, sessions: [], failed: true })
      })

    return () => controller.abort()
  }, [month, key])

  const loading = result.key !== key

  return {
    sessions: result.sessions,
    loading,
    error: !loading && result.failed,
    retry: () => setAttempt((count) => count + 1),
  }
}
