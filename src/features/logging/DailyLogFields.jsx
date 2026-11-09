import { useId, useState } from 'react'
import Icon from '../../components/Icon'
import { DEFAULT_SETTINGS } from '../settings/settingsData'
import { formatSleep, KJ_PER_KCAL } from './dailyLogData'
import './dailyLogFields.css'

const NUTRITION = [
  { key: 'calories', label: 'Calories', unit: 'kcal', max: 20000 },
  { key: 'protein', label: 'Protein', unit: 'g', max: 2000 },
  { key: 'carbs', label: 'Carbs', unit: 'g', max: 2000 },
  { key: 'fat', label: 'Fat', unit: 'g', max: 2000 },
]

const DEFAULT_MODES = {}
const DEFAULT_TARGETS = DEFAULT_SETTINGS.targets
const DEFAULT_UNITS = { energy: 'kcal' }
const EMPTY_VALUE = { amounts: {}, checks: {}, sleepMinutes: '' }

function SectionHeading({ id, children, onSettings }) {
  return (
    <div className="daily-log-section-heading">
      <h3 id={id}>{children}</h3>
      {onSettings && (
        <button className="daily-log-settings-link" type="button" onClick={onSettings}>
          Settings
        </button>
      )}
    </div>
  )
}

function GoalCheck({ label, detail, checked, onChange, className = '' }) {
  return (
    <label className={`daily-log-goal ${checked ? 'is-checked' : ''} ${className}`}>
      <input type="checkbox" checked={Boolean(checked)} onChange={onChange} />
      <span className="daily-log-goal-copy">
        <span>{label}</span>
        <small>{detail}</small>
      </span>
    </label>
  )
}

function NutritionAmount({ metric, value, onChange }) {
  return (
    <label className={`daily-log-amount daily-log-${metric.key}`}>
      <span className="daily-log-amount-label">
        <span className="daily-log-metric-dot" aria-hidden="true" />
        {metric.label}
      </span>
      <span className="daily-log-amount-entry">
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max={metric.max}
          step="1"
          value={value ?? ''}
          placeholder="0"
          aria-label={`${metric.label} amount in ${metric.unit}`}
          onChange={onChange}
        />
        <span>{metric.unit}</span>
      </span>
    </label>
  )
}

function SleepAmount({ value, target, onChange }) {
  const [editing, setEditing] = useState(false)
  const hasValue = value !== '' && value != null
  const duration = hasValue ? formatSleep(value) : formatSleep(target)

  function adjust(minutes) {
    const current = hasValue ? Number(value) : target
    onChange(String(Math.max(0, Math.min(1440, current + minutes))))
  }

  return (
    <div className="daily-log-sleep-amount">
      <div className="daily-log-sleep-row">
        <div className="daily-log-sleep-copy">
          <Icon name="moon" size={22} />
          <span>
            <strong>Last night</strong>
            <small>Bedtime to wake-up</small>
          </span>
        </div>
        <div className="daily-log-sleep-controls">
          <button
            className="daily-log-sleep-step"
            type="button"
            aria-label="Decrease sleep by 15 minutes"
            onClick={() => adjust(-15)}
            disabled={hasValue && Number(value) === 0}
          >
            <span aria-hidden="true">−</span>
          </button>
          <button
            className={`daily-log-sleep-duration ${hasValue ? '' : 'is-placeholder'}`}
            type="button"
            aria-label="Edit sleep duration"
            aria-expanded={editing}
            onClick={() => setEditing((current) => !current)}
          >
            <span aria-live="polite">{duration}</span>
            {!hasValue && <small>Not logged yet</small>}
          </button>
          <button
            className="daily-log-sleep-step"
            type="button"
            aria-label="Increase sleep by 15 minutes"
            onClick={() => adjust(15)}
            disabled={hasValue && Number(value) === 1440}
          >
            <Icon name="plus" size={17} />
          </button>
        </div>
      </div>
      {editing && (
        <label className="daily-log-sleep-edit">
          Sleep duration
          <span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="1"
              value={value ?? ''}
              placeholder={String(target)}
              aria-label="Sleep duration in minutes"
              onChange={(event) => onChange(event.target.value)}
            />
            <span>min</span>
          </span>
        </label>
      )}
    </div>
  )
}

export default function DailyLogFields({
  modes = DEFAULT_MODES,
  targets = DEFAULT_TARGETS,
  units = DEFAULT_UNITS,
  value = EMPTY_VALUE,
  onChange,
  onSettings,
}) {
  const id = useId()
  const nutrition = NUTRITION.filter((metric) => ['amount', 'goal'].includes(modes[metric.key]))
  const allNutritionGoals =
    nutrition.length > 0 && nutrition.every((metric) => modes[metric.key] === 'goal')
  const sleepEnabled = ['amount', 'goal'].includes(modes.sleep)
  const energyFactor = units.energy === 'kj' ? KJ_PER_KCAL : 1

  function updateAmount(key, amount) {
    onChange({ ...value, amounts: { ...value.amounts, [key]: amount } })
  }

  function updateCheck(key, checked) {
    onChange({ ...value, checks: { ...value.checks, [key]: checked } })
  }

  if (nutrition.length === 0 && !sleepEnabled) return null

  return (
    <div className="daily-log-fields">
      {nutrition.length > 0 && (
        <section className="daily-log-section" aria-labelledby={`${id}-nutrition`}>
          <SectionHeading id={`${id}-nutrition`} onSettings={onSettings}>
            {allNutritionGoals ? 'Nutrition goals' : 'Nutrition'}
          </SectionHeading>
          <div className="daily-log-nutrition-grid">
            {nutrition.map((metric) => {
              const isEnergy = metric.key === 'calories'
              const displayMetric =
                isEnergy && energyFactor !== 1
                  ? { ...metric, unit: 'kJ', max: Math.round(metric.max * energyFactor) }
                  : metric
              const target = Math.round(
                (targets[metric.key] ?? DEFAULT_TARGETS[metric.key]) *
                  (isEnergy ? energyFactor : 1),
              )

              if (modes[metric.key] === 'goal') {
                return (
                  <GoalCheck
                    key={metric.key}
                    label={
                      <span className={`daily-log-goal-label daily-log-${metric.key}`}>
                        <span className="daily-log-metric-dot" aria-hidden="true" />
                        {metric.label}
                      </span>
                    }
                    detail={`Goal ${target} ${displayMetric.unit}`}
                    checked={value.checks?.[metric.key]}
                    onChange={(event) => updateCheck(metric.key, event.target.checked)}
                  />
                )
              }

              return (
                <NutritionAmount
                  key={metric.key}
                  metric={displayMetric}
                  value={value.amounts?.[metric.key]}
                  onChange={(event) => updateAmount(metric.key, event.target.value)}
                />
              )
            })}
          </div>
        </section>
      )}
      {sleepEnabled && (
        <section className="daily-log-section" aria-labelledby={`${id}-sleep`}>
          <SectionHeading
            id={`${id}-sleep`}
            onSettings={nutrition.length === 0 ? onSettings : null}
          >
            {modes.sleep === 'goal' ? 'Sleep goal' : 'Sleep'}
          </SectionHeading>
          {modes.sleep === 'goal' ? (
            <GoalCheck
              className="daily-log-sleep-goal"
              label={
                <span className="daily-log-sleep-goal-label">
                  <Icon name="moon" size={20} />
                  Slept {formatSleep(targets.sleep ?? DEFAULT_TARGETS.sleep)} or more
                </span>
              }
              detail="Last night · goal from Settings"
              checked={value.checks?.sleep}
              onChange={(event) => updateCheck('sleep', event.target.checked)}
            />
          ) : (
            <SleepAmount
              value={value.sleepMinutes}
              target={targets.sleep ?? DEFAULT_TARGETS.sleep}
              onChange={(sleepMinutes) => onChange({ ...value, sleepMinutes })}
            />
          )}
        </section>
      )}
    </div>
  )
}
