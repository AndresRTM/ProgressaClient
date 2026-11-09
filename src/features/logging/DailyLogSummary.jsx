import { useId } from 'react'
import Icon from '../../components/Icon'
import { formatSleep, KJ_PER_KCAL } from './dailyLogData'
import './dailyLogSummary.css'

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
]

const DEFAULT_UNITS = { energy: 'kcal' }

function amountLabel(metric, amount, units) {
  if (metric.key === 'calories' && units.energy === 'kj') {
    return `${Math.round(amount * KJ_PER_KCAL).toLocaleString('en-GB')} kJ`
  }
  return `${amount.toLocaleString('en-GB', { maximumFractionDigits: 2 })} ${metric.unit}`
}

function LogEntry({ metric, amount, checked, units }) {
  const hasAmount = Number.isFinite(amount)
  return (
    <div
      className={`daily-log-summary-entry daily-log-summary-${metric.key} ${checked ? 'is-complete' : ''}`}
    >
      <dt>
        <span className="daily-log-summary-dot" aria-hidden="true" />
        {metric.label}
        {!hasAmount && ' goal'}
      </dt>
      <dd>
        <span>{hasAmount ? amountLabel(metric, amount, units) : 'Done'}</span>
        {checked && (
          <span
            className="daily-log-summary-check"
            role="img"
            aria-label={`${metric.label} goal reached`}
          >
            <Icon name="check" size={13} />
          </span>
        )}
      </dd>
    </div>
  )
}

export default function DailyLogSummary({ log, units = DEFAULT_UNITS, embedded = false }) {
  const id = useId()
  const nutrition = METRICS.filter(
    (metric) => Number.isFinite(log?.amounts?.[metric.key]) || log?.checks?.[metric.key] === true,
  )
  const hasSleepAmount = Number.isFinite(log?.sleepMinutes)
  const sleepChecked = log?.checks?.sleep === true
  const Heading = embedded ? 'h3' : 'h2'

  if (nutrition.length === 0 && !hasSleepAmount && !sleepChecked) return null

  return (
    <section
      className={`daily-log-summary ${embedded ? 'daily-log-summary-embedded' : 'home-card'}`}
      aria-labelledby={id}
    >
      <Heading id={id}>Today's log</Heading>
      <dl className="daily-log-summary-entries">
        {nutrition.map((metric) => (
          <LogEntry
            key={metric.key}
            metric={metric}
            amount={log.amounts?.[metric.key]}
            checked={log.checks?.[metric.key] === true}
            units={units}
          />
        ))}
        {(hasSleepAmount || sleepChecked) && (
          <div
            className={`daily-log-summary-entry daily-log-summary-sleep ${sleepChecked ? 'is-complete' : ''}`}
          >
            <dt>
              <Icon name="moon" size={14} />
              Sleep{!hasSleepAmount && ' goal'}
            </dt>
            <dd>
              <span>{hasSleepAmount ? formatSleep(log.sleepMinutes) : 'Done'}</span>
              {sleepChecked && (
                <span
                  className="daily-log-summary-check"
                  role="img"
                  aria-label="Sleep goal reached"
                >
                  <Icon name="check" size={13} />
                </span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
