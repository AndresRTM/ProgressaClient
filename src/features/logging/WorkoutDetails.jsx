import { useEffect, useRef, useState } from 'react'
import SportPicture from '../settings/SportPicture'
import { INTENSITY_OPTIONS, INTENSITY_PACES, intensityOf, NO_PACE } from '../home/homeData'
import './workoutDetails.css'

const DURATION_OPTIONS = [20, 30, 40, 60]

function initialTime(plannedActivity) {
  if (plannedActivity?.time) return plannedActivity.time
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function initialDuration(plannedActivity) {
  const duration = plannedActivity?.duration
  return Number.isInteger(duration) && duration >= 1 && duration <= 1440 ? duration : 30
}

export default function WorkoutDetails({
  sport,
  picture,
  plannedActivity,
  date,
  onChangeSport,
  onSave,
}) {
  const headingRef = useRef(null)
  const [duration, setDuration] = useState(() => initialDuration(plannedActivity))
  const [customDuration, setCustomDuration] = useState(() => !DURATION_OPTIONS.includes(duration))
  const [intensity, setIntensity] = useState(() => intensityOf(plannedActivity))
  const [time] = useState(() => initialTime(plannedActivity))
  const subtitle = plannedActivity
    ? `Planned ${plannedActivity.time} · ${plannedActivity.duration} min${plannedActivity.pace ? ` · ${plannedActivity.pace}` : ''}`
    : 'Choose your duration and intensity'

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.closest('dialog')?.scrollTo({ top: 0 })
  }, [])

  function submit(event) {
    event.preventDefault()
    const activity = {
      type: sport.id,
      date,
      time,
      duration: Number(duration),
      pace: INTENSITY_PACES[intensity] ?? NO_PACE,
      intensity,
    }
    if (!Number.isInteger(activity.duration) || activity.duration < 1 || activity.duration > 1440)
      return
    onSave(activity)
  }

  return (
    <form className="workout-details" onSubmit={submit}>
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
          onClick={onChangeSport}
        >
          Change
        </button>
      </div>

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
        Log workout
      </button>
    </form>
  )
}
