import { useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import SportPicture from './SportPicture'
import { SPORTS } from './settingsData'
import './logging.css'

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', max: 10000 },
  { key: 'protein', label: 'Protein', unit: 'g', max: 1000 },
  { key: 'carbs', label: 'Carbs', unit: 'g', max: 1000 },
  { key: 'fat', label: 'Fat', unit: 'g', max: 1000 },
  { key: 'sleep', label: 'Sleep', unit: 'min', max: 1440 },
]

const DEFAULT_UNITS = { energy: 'kcal' }

function loggingMetrics(units) {
  if (units.energy !== 'kj') return METRICS
  return METRICS.map((metric) =>
    metric.key === 'calories' ? { ...metric, unit: 'kJ', factor: 4.184 } : metric,
  )
}

function displayAmount(metric, amount) {
  return Math.round(amount * (metric.factor || 1))
}

const MODES = [
  { value: 'off', label: 'Off' },
  { value: 'amount', label: 'Log amount' },
  { value: 'goal', label: 'Check goal' },
]

function sportLabel(id) {
  const sport = SPORTS.find((item) => item.id === id)
  if (sport) return sport.label
  return id.replace(/[-_]/g, ' ').replace(/^./, (letter) => letter.toUpperCase())
}

function LoggingPreview({ value, targets, metrics, favoriteSports, sportPictures, onClose }) {
  const favorites = favoriteSports
    .map((id) => SPORTS.find((sport) => sport.id === id))
    .filter(Boolean)
  const visibleMetrics = metrics.filter((metric) => value[metric.key] !== 'off')

  return (
    <Sheet title="Log today preview" onClose={onClose}>
      <p className="sheet-description">A preview of your settings. Entries here are read-only.</p>
      <section className="logging-preview-training" aria-label="Training preview">
        <h3>Training</h3>
        <div className="logging-preview-sports">
          {favorites.map((sport) => (
            <div key={sport.id}>
              <SportPicture sport={sport} picture={sportPictures?.[sport.id]} size={40} />
              <span>{sport.label}</span>
            </div>
          ))}
        </div>
        {!favorites.length && <p>Choose favorite sports in Settings.</p>}
      </section>
      <div className="logging-preview-metrics">
        {visibleMetrics.map((metric) => (
          value[metric.key] === 'goal' ? (
            <label className="logging-preview-goal" key={metric.key}>
              <input type="checkbox" disabled />
              <span>{metric.label}<small>Goal {targetLabel(metric, targets[metric.key])}</small></span>
            </label>
          ) : (
            <label className="logging-preview-amount" key={metric.key}>
              <span>{metric.label}</span>
              <input
                type="number"
                readOnly
                aria-label={`${metric.label} amount preview`}
                placeholder={`Amount (${metric.unit})`}
              />
            </label>
          )
        ))}
      </div>
      <button className="primary-button logging-preview-close" type="button" onClick={onClose}>
        Done
      </button>
    </Sheet>
  )
}

function targetLabel(metric, amount) {
  if (metric.key === 'sleep') {
    const hours = Math.floor(amount / 60)
    const minutes = amount % 60
    if (!hours) return `${minutes} min`
    if (!minutes) return `${hours} h`
    return `${hours} h ${minutes} min`
  }
  return `${displayAmount(metric, amount)} ${metric.unit}`
}

function MetricSetting({ metric, mode, target, onChange, onEdit }) {
  return (
    <div className={`logging-metric logging-metric-${metric.key}`}>
      <div className="logging-metric-heading">
        <span className="logging-metric-name">
          {metric.key === 'sleep' ? (
            <Icon name="moon" size={19} />
          ) : (
            <span className={`logging-dot logging-dot-${metric.key}`} />
          )}
          {metric.label}
        </span>
        {mode === 'goal' ? (
          <button
            className="logging-goal-button"
            onClick={onEdit}
            aria-label={`Edit ${metric.label.toLowerCase()} goal, currently ${targetLabel(metric, target)}`}
          >
            Goal {targetLabel(metric, target)}
            <Icon name="edit" size={12} />
          </button>
        ) : (
          <span className={`logging-mode-description ${mode === 'off' ? 'logging-hidden' : ''}`}>
            {mode === 'amount' ? 'You type the amount' : 'Hidden in Log today'}
          </span>
        )}
      </div>
      <div className="logging-segments" role="group" aria-label={`${metric.label} logging mode`}>
        {MODES.map((item) => (
          <button
            key={item.value}
            className={`logging-segment ${mode === item.value ? 'is-selected' : ''}`}
            aria-pressed={mode === item.value}
            onClick={() => onChange(metric.key, item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TargetEditor({ metric, target, onSave, onClose }) {
  function submit(event) {
    event.preventDefault()
    const amount = Number(new FormData(event.currentTarget).get('target'))
    if (
      !Number.isInteger(amount) ||
      amount < displayAmount(metric, 1) ||
      amount > displayAmount(metric, metric.max)
    )
      return
    const canonicalAmount = Math.round(amount / (metric.factor || 1))
    if (canonicalAmount < 1 || canonicalAmount > metric.max) return
    onSave(metric.key, canonicalAmount)
    onClose()
  }

  return (
    <Sheet title={`${metric.label} goal`} onClose={onClose}>
      <p className="sheet-description">Set the daily target you can check off in Log today.</p>
      <form className="home-form" onSubmit={submit}>
        <label>
          Daily target ({metric.key === 'sleep' ? 'minutes' : metric.unit})
          <input
            name="target"
            type="number"
            min={displayAmount(metric, 1)}
            max={displayAmount(metric, metric.max)}
            step="1"
            defaultValue={displayAmount(metric, target)}
            required
          />
        </label>
        {metric.key === 'sleep' && (
          <p className="logging-target-help">For example, 450 minutes is 7 hours and 30 minutes.</p>
        )}
        <button className="primary-button" type="submit">
          Save goal
        </button>
      </form>
    </Sheet>
  )
}

export default function LoggingSettings({
  value,
  targets,
  favoriteSports,
  units = DEFAULT_UNITS,
  sportPictures,
  onChange,
  onTargetChange,
  onFavorites,
}) {
  const [editingMetric, setEditingMetric] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const favoriteNames = favoriteSports.slice(0, 3).map(sportLabel).join(', ')
  const favoriteSummary =
    favoriteSports.length > 3 ? `${favoriteNames} +${favoriteSports.length - 3}` : favoriteNames
  const metrics = loggingMetrics(units)
  const sleep = metrics.find((metric) => metric.key === 'sleep')

  return (
    <div className="logging-sections">
      <section className="settings-card logging-training" aria-labelledby="logging-training-title">
        <h2 className="settings-section-label" id="logging-training-title">
          Training
        </h2>
        <p className="logging-section-description">Always part of Log today.</p>
        <div className="logging-workouts-row">
          <div>
            <h3>Workouts</h3>
            <p>Pick from favorites or search</p>
          </div>
          <span className="logging-always-on">
            <Icon name="lock" size={12} />
            Always on
          </span>
        </div>
        <button className="logging-favorites-row" onClick={onFavorites}>
          <span>
            <strong>Favorite sports</strong>
            <span>{favoriteSummary || 'Choose your favorite sports'}</span>
          </span>
          <Icon name="chevron-right" size={18} />
        </button>
      </section>

      <section
        className="settings-card logging-nutrition"
        aria-labelledby="logging-nutrition-title"
      >
        <h2 className="settings-section-label" id="logging-nutrition-title">
          Nutrition
        </h2>
        <p className="logging-section-description">
          Choose per item: hidden, type the amount, or just tick off your goal.
        </p>
        {metrics
          .filter((metric) => metric.key !== 'sleep')
          .map((metric) => (
            <MetricSetting
              key={metric.key}
              metric={metric}
              mode={value[metric.key]}
              target={targets[metric.key]}
              onChange={onChange}
              onEdit={() => setEditingMetric(metric)}
            />
          ))}
      </section>

      <section className="settings-card logging-sleep" aria-labelledby="logging-sleep-title">
        <h2 className="settings-section-label" id="logging-sleep-title">
          Sleep
        </h2>
        <MetricSetting
          metric={sleep}
          mode={value.sleep}
          target={targets.sleep}
          onChange={onChange}
          onEdit={() => setEditingMetric(sleep)}
        />
      </section>

      <section className="settings-card logging-summary" aria-labelledby="logging-summary-title">
        <h2 className="settings-section-label" id="logging-summary-title">
          In Log today
        </h2>
        <p className="logging-section-description">Preview the logging options you've selected.</p>
        <div className="logging-chips" aria-live="polite">
          <span className="logging-chip">
            <span className="logging-dot logging-dot-training" />
            Training
          </span>
          {metrics
            .filter((metric) => value[metric.key] !== 'off')
            .map((metric) => (
              <span className="logging-chip" key={metric.key}>
                <span className={`logging-dot logging-dot-${metric.key}`} />
                {metric.label} · {value[metric.key] === 'amount' ? 'amount' : 'goal check'}
              </span>
            ))}
        </div>
        <button
          className="primary-button logging-preview-button"
          onClick={() => setPreviewOpen(true)}
        >
          Preview Log today
          <Icon name="arrow-right" size={18} />
        </button>
      </section>

      {editingMetric && (
        <TargetEditor
          metric={editingMetric}
          target={targets[editingMetric.key]}
          onSave={onTargetChange}
          onClose={() => setEditingMetric(null)}
        />
      )}
      {previewOpen && (
        <LoggingPreview
          value={value}
          targets={targets}
          metrics={metrics}
          favoriteSports={favoriteSports}
          sportPictures={sportPictures}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  )
}
