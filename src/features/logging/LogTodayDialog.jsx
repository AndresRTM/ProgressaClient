import { useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import { useSports } from '../activities/useSports'
import ActivityPicker from './ActivityPicker'
import DailyLogFields from './DailyLogFields'
import { KJ_PER_KCAL } from './dailyLogData'
import WorkoutDetails from './WorkoutDetails'
import './logToday.css'

function initialDraft(saved, initialValues) {
  return (
    initialValues || {
      amounts: {},
      checks: { ...saved?.checks },
      sleepMinutes: saved?.sleepMinutes ?? '',
    }
  )
}

export default function LogTodayDialog({
  date,
  activities = [],
  settings,
  sportPictures,
  dailyLog,
  initialValues,
  onLogWorkout,
  onSaveDailyLog,
  onFavoriteChange,
  onEditFavorites,
  onLoggingSettings,
  onClose,
  preview = false,
  dataError,
}) {
  const { sports } = useSports()
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState(() => initialDraft(dailyLog, initialValues))
  const [searching, setSearching] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const sport = sports.find((item) => item.id === selected)
  const plannedActivity = activities.find(
    (activity) => activity.type === selected && activity.date === date && !activity.logged,
  )
  const hasDailyFields = Object.values(settings.logging).some((mode) => mode !== 'off')
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  function logWorkout(workout) {
    if (!preview && !onLogWorkout(workout, plannedActivity?.id)) {
      setError('This workout could not be logged. Check its details and try again.')
      return false
    }
    setError('')
    if (!hasDailyFields) onClose()
    else {
      setFeedback(
        `${preview ? 'Preview: ' : ''}${sport.label} · ${workout.duration} min${preview ? '' : ' logged'}`,
      )
      setSelected(null)
      setSearching(false)
    }
    return true
  }

  function saveDailyLog(event) {
    event.preventDefault()
    const patch = { amounts: {}, checks: {} }
    for (const [key, mode] of Object.entries(settings.logging)) {
      if (mode === 'goal') patch.checks[key] = Boolean(draft.checks[key])
      if (mode !== 'amount') continue
      const raw = key === 'sleep' ? draft.sleepMinutes : draft.amounts[key]
      if (raw === undefined || raw === '') continue
      let amount = Number(raw)
      if (!Number.isFinite(amount) || amount < 0) {
        setError('Enter a valid amount for each field.')
        return
      }
      if (key === 'sleep') patch.sleepMinutes = amount
      else {
        if (key === 'calories' && settings.units.energy === 'kj')
          amount = Math.round(amount / KJ_PER_KCAL)
        patch.amounts[key] = amount
      }
    }
    if (preview || onSaveDailyLog(date, patch)) onClose()
    else setError('This log could not be saved. Check the amounts and try again.')
  }

  return (
    <Sheet title="Log today" onClose={onClose} className="log-sheet" showHandle>
      <p className="log-date">{dateLabel}</p>
      {preview && <p className="log-preview-note">Preview only. Entries here aren't saved.</p>}
      {sport ? (
        <WorkoutDetails
          key={sport.id}
          sport={sport}
          picture={sportPictures?.[sport.id]}
          plannedActivity={plannedActivity}
          date={date}
          onChangeSport={() => {
            setSelected(null)
            setSearching(false)
          }}
          onSave={logWorkout}
        />
      ) : (
        <>
          <ActivityPicker
            favoriteSports={settings.favoriteSports}
            sportPictures={sportPictures}
            activities={activities}
            date={date}
            heading={hasDailyFields ? 'Training' : 'Favorites'}
            onSelect={(id) => {
              setSelected(id)
              setError('')
            }}
            onSearchChange={setSearching}
            allowCreate={!preview}
            onFavoriteChange={onFavoriteChange}
            onEditFavorites={onEditFavorites ? () => onEditFavorites(draft) : undefined}
          />
          {feedback && (
            <p className="log-workout-feedback" role="status">
              <Icon name="check" size={15} />
              {feedback}
            </p>
          )}
          {!searching &&
            (hasDailyFields ? (
              <form className="log-daily-form" onSubmit={saveDailyLog}>
                <DailyLogFields
                  modes={settings.logging}
                  targets={settings.targets}
                  units={settings.units}
                  value={draft}
                  onChange={setDraft}
                  onSettings={onLoggingSettings ? () => onLoggingSettings(draft) : undefined}
                />
                <button className="primary-button log-save" type="submit">
                  Save log
                </button>
              </form>
            ) : (
              <p className="log-picker-help">
                Tap what you trained today. Choose your duration and intensity next.
              </p>
            ))}
        </>
      )}
      {(error || dataError) && (
        <p className="log-error" role="alert">
          {error || dataError}
        </p>
      )}
    </Sheet>
  )
}
