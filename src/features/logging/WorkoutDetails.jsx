import { useEffect, useRef, useState } from 'react'
import SportPicture from '../settings/SportPicture'
import { INTENSITY_PACES, NO_PACE } from '../home/homeData'
import './workoutDetails.css'

const DURATION_OPTIONS = [20, 30, 40, 60]
const INTENSITY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
]

function initialTime(plannedActivity) {
  if (plannedActivity?.time) return plannedActivity.time
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function initialDuration(plannedActivity) {
  const duration = plannedActivity?.duration
  return Number.isInteger(duration) && duration >= 1 && duration <= 1440 ? duration : 30
}

function initialIntensity(plannedActivity) {
  if (plannedActivity?.intensity === null) return null
  if (INTENSITY_OPTIONS.some((option) => option.value === plannedActivity?.intensity)) {
    return plannedActivity.intensity
  }
  // Older saved activities only have a pace label, so read the intensity from it.
  const pace = plannedActivity?.pace?.toLowerCase() || ''
  if (pace.includes('hard') || pace.includes('challenge')) return 'hard'
  if (pace.includes('moderate') || pace.includes('steady')) return 'moderate'
  if (pace === 'unspecified' || pace === 'not specified') return null
  return 'easy'
}

export default function WorkoutDetails({
  sport,
  picture,
  plannedActivity,
  date,
  kind = 'log',
  onChangeSport,
  onSave,
}) {
  const formRef = useRef(null)
  const headingRef = useRef(null)
  const [duration, setDuration] = useState(() => initialDuration(plannedActivity))
  const [customDuration, setCustomDuration] = useState(() => !DURATION_OPTIONS.includes(duration))
  const [intensity, setIntensity] = useState(() => initialIntensity(plannedActivity))
  const [time] = useState(() => initialTime(plannedActivity))
  const isEditing = kind === 'edit'
  const isScheduling = kind === 'plan' || isEditing
  const subtitle = isEditing
    ? 'Update this activity in your calendar'
    : plannedActivity
    ? `Planned ${plannedActivity.time} · ${plannedActivity.duration} min${plannedActivity.pace ? ` · ${plannedActivity.pace}` : ''}`
    : 'Choose your duration and intensity'

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.closest('dialog')?.scrollTo({ top: 0 })
  }, [])

  function currentValues(form) {
    const data = new FormData(form)
    return {
      type: sport.id,
      date: isScheduling ? data.get('date') : date,
      time: isScheduling ? data.get('time') : time,
      duration: Number(duration),
      pace: isEditing && intensity === initialIntensity(plannedActivity)
        ? plannedActivity.pace
        : INTENSITY_PACES[intensity] ?? NO_PACE,
      intensity,
    }
  }

  function submit(event) {
    event.preventDefault()
    const activity = currentValues(event.currentTarget)
    if (!Number.isInteger(activity.duration) || activity.duration < 1 || activity.duration > 1440)
      return
    onSave(activity)
  }

  return (
    <form ref={formRef} className="workout-details" onSubmit={submit}>
      <div className="workout-selected-sport">
        <SportPicture sport={sport} picture={picture} size={36} />
        <div className="workout-selected-copy">
          <h3 ref={headingRef} tabIndex={-1}>
            {sport.label}
          </h3>
          <p>{subtitle}</p>
        </div>
        <button
          type="button"
          className="workout-change-sport"
          onClick={() => onChangeSport(currentValues(formRef.current))}
        >
          Change
        </button>
      </div>

      {isScheduling && (
        <div className="workout-schedule-fields">
          <label>
            Date
            <input type="date" name="date" defaultValue={date} required />
          </label>
          <label>
            Time
            <input type="time" name="time" defaultValue={time} required />
          </label>
        </div>
      )}

      <fieldset className="workout-option-group">
        <legend>Duration</legend>
        <div className="workout-duration-options">
          {DURATION_OPTIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={!customDuration && duration === minutes}
              onClick={() => {
                setDuration(minutes)
                setCustomDuration(false)
              }}
            >
              {minutes} min
            </button>
          ))}
          <button
            type="button"
            aria-pressed={customDuration}
            onClick={() => setCustomDuration(true)}
          >
            Other
          </button>
        </div>
        {customDuration && (
          <label className="workout-custom-duration">
            Duration in minutes
            <input
              type="number"
              name="duration"
              min="1"
              max="1440"
              step="1"
              inputMode="numeric"
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              required
              autoFocus
            />
          </label>
        )}
      </fieldset>

      <fieldset className="workout-option-group">
        <legend>Intensity · optional</legend>
        <div className="workout-intensity-options">
          {INTENSITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={intensity === option.value}
              onClick={() =>
                setIntensity((current) => (current === option.value ? null : option.value))
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button type="submit" className="workout-save-button">
        {isEditing ? 'Save changes' : isScheduling ? 'Add activity' : 'Log workout'}
      </button>
    </form>
  )
}
