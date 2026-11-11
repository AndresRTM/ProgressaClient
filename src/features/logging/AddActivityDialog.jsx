import { useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import { useSports } from '../activities/useSports'
import SportPicture from '../settings/SportPicture'
import {
  dateAtOffset,
  dayTitle,
  DEMO_TODAY,
  formatWeekRange,
  INTENSITY_OPTIONS,
  INTENSITY_PACES,
  intensityOf,
  NO_PACE,
  startOfWeek,
  weekDays,
} from '../home/homeData'
import ActivityPicker from './ActivityPicker'
import './logToday.css'
import './addSession.css'

const DURATIONS = [15, 20, 30, 45, 60, 75, 90, 120]

export default function AddActivityDialog({
  activity,
  selectedDate,
  activityType,
  weekStartsOn,
  favoriteSports,
  sportPictures,
  onFavoriteChange,
  onSave,
  onClose,
}) {
  const { sports } = useSports()
  const editing = Boolean(activity)
  const favorites = favoriteSports
    .map((id) => sports.find((sport) => sport.id === id))
    .filter(Boolean)
  const [type, setType] = useState(activity?.type ?? activityType ?? favorites[0]?.id ?? null)
  const [date, setDate] = useState(activity?.date ?? selectedDate)
  const [time, setTime] = useState(activity?.time ?? '18:00')
  const [duration, setDuration] = useState(activity?.duration ?? 30)
  const [intensity, setIntensity] = useState(() => (activity ? intensityOf(activity) : 'moderate'))
  const [repeat, setRepeat] = useState(false)
  const [choosingSport, setChoosingSport] = useState(false)
  const [error, setError] = useState('')

  const sport = sports.find((item) => item.id === type)
  const sportTiles = favorites.slice(0, 4)
  if (sport && !sportTiles.includes(sport)) sportTiles.push(sport)
  const durations = DURATIONS.includes(duration)
    ? DURATIONS
    : [...DURATIONS, duration].sort((a, b) => a - b)
  const weekStart = startOfWeek(date, weekStartsOn)
  const canGoBack = weekStart > startOfWeek(DEMO_TODAY, weekStartsOn)

  // Keep the same weekday in the new week, but never land on a day that has passed.
  function changeWeek(delta) {
    const nextDate = dateAtOffset(date, delta * 7)
    setDate(nextDate < DEMO_TODAY ? DEMO_TODAY : nextDate)
  }

  function submit(event) {
    event.preventDefault()
    if (!sport) {
      setError('Choose a sport first.')
      return
    }
    const keepPace = editing && intensity === intensityOf(activity)
    const saved = onSave(
      {
        type,
        date,
        time,
        duration,
        intensity,
        pace: keepPace ? activity.pace : (INTENSITY_PACES[intensity] ?? NO_PACE),
      },
      repeat,
    )
    if (!saved) setError('This session could not be saved. Check its details and try again.')
  }

  if (choosingSport) {
    return (
      <Sheet title="Choose a sport" onClose={onClose} className="log-sheet" showHandle>
        <button type="button" className="add-session-back" onClick={() => setChoosingSport(false)}>
          Back to session
        </button>
        <ActivityPicker
          favoriteSports={favoriteSports}
          sportPictures={sportPictures}
          date={date}
          onFavoriteChange={onFavoriteChange}
          onSelect={(id) => {
            setType(id)
            setChoosingSport(false)
            setError('')
          }}
        />
      </Sheet>
    )
  }

  return (
    <Sheet
      title={editing ? 'Edit session' : 'Add session'}
      onClose={onClose}
      className="log-sheet"
      showHandle
    >
      <p className="log-date">{dayTitle(date)}</p>
      <form className="add-session" onSubmit={submit}>
        <div role="group" aria-labelledby="add-session-sport">
          <div className="add-session-heading">
            <span className="add-session-label" id="add-session-sport">
              Sport
            </span>
            <button
              type="button"
              className="add-session-all-sports"
              onClick={() => setChoosingSport(true)}
            >
              All sports
            </button>
          </div>
          <div className="add-session-sports">
            {sportTiles.map((item) => (
              <button
                key={item.id}
                type="button"
                className="add-session-tile"
                aria-pressed={item.id === type}
                onClick={() => {
                  setType(item.id)
                  setError('')
                }}
              >
                {sportPictures?.[item.id] ? (
                  <SportPicture sport={item} picture={sportPictures[item.id]} size={28} />
                ) : (
                  <Icon
                    name={item.icon}
                    size={24}
                    className={`activity-icon activity-icon--${item.id}`}
                    style={{ '--sport-color': item.color }}
                  />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-labelledby="add-session-day">
          <div className="add-session-heading">
            <span className="add-session-label" id="add-session-day">
              Day
            </span>
            <div className="add-session-week">
              <button
                type="button"
                className="previous-week"
                onClick={() => changeWeek(-1)}
                disabled={!canGoBack}
                aria-label="Previous week"
              >
                <Icon name="chevron-right" size={14} />
              </button>
              <span>{formatWeekRange(weekStart)}</span>
              <button type="button" onClick={() => changeWeek(1)} aria-label="Next week">
                <Icon name="chevron-right" size={14} />
              </button>
            </div>
          </div>
          <div className="add-session-days">
            {weekDays(weekStart).map((day) => (
              <button
                key={day.date}
                type="button"
                className="add-session-tile"
                aria-pressed={day.date === date}
                aria-label={dayTitle(day.date)}
                disabled={day.date < DEMO_TODAY && day.date !== date}
                onClick={() => setDate(day.date)}
              >
                <small>{day.day}</small>
                <span>{day.dayNumber}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="add-session-fields">
          <label>
            <span className="add-session-label">Start time</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>
          <label>
            <span className="add-session-label">Duration</span>
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              {durations.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="add-session-label">Intensity</legend>
          <div className="add-session-intensity">
            {INTENSITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={intensity === option.value}
                onClick={() => setIntensity(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {!editing && (
          <div className="add-session-repeat">
            <span>
              Repeat every week
              <small>Same day and time</small>
            </span>
            <button
              className="notif-switch"
              type="button"
              role="switch"
              aria-label="Repeat every week"
              aria-checked={repeat}
              onClick={() => setRepeat((current) => !current)}
            >
              <span />
            </button>
          </div>
        )}

        <button className="primary-button log-save" type="submit">
          {editing ? 'Save changes' : 'Add to plan'}
        </button>
        {error && (
          <p className="log-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Sheet>
  )
}
