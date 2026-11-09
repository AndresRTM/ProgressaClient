import { useLayoutEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import SportPicture from '../settings/SportPicture'
import DailyLogSummary from '../logging/DailyLogSummary'
import { useSports } from '../activities/useSports'
import { formatTime } from '../settings/formatTime'
import { ActivityChart, ActivityRow, GoalRows, WeekDays } from './HomeCards'
import { dateAtOffset, formatDuration, formatWeekRange, weekDays } from './homeData'
import './calendarActivity.css'

function validFavoriteSports(favoriteSports, activityTypes) {
  return [...new Set(favoriteSports)].filter((type) => Object.hasOwn(activityTypes, type))
}

export function AddGoalDialog({ onSave, onClose }) {
  const { activityTypes } = useSports()
  const [metric, setMetric] = useState('sessions')
  function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSave({
      title: data.get('title').trim(),
      metric,
      activityType: metric === 'sessions' ? data.get('activityType') : undefined,
      target: Number(data.get('target')),
      color:
        metric === 'minutes'
          ? 'strength'
          : metric === 'variety'
            ? 'swimming'
            : data.get('activityType'),
    })
  }
  return (
    <Sheet title="Small steps start here." onClose={onClose}>
      <p className="sheet-description">Choose a goal that works for your week.</p>
      <form className="home-form" onSubmit={submit}>
        <label>
          Goal name
          <input
            name="title"
            placeholder="e.g. Go for 3 runs"
            maxLength="60"
            pattern=".*\S.*"
            required
          />
        </label>
        <label>
          Measure
          <select value={metric} onChange={(event) => setMetric(event.target.value)}>
            <option value="sessions">Number of sessions</option>
            <option value="minutes">Minutes of movement</option>
            <option value="variety">Different activities</option>
          </select>
        </label>
        {metric === 'sessions' && (
          <label>
            Activity
            <select name="activityType" defaultValue="running">
              {Object.entries(activityTypes).map(([value, type]) => (
                <option key={value} value={value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          {metric === 'minutes'
            ? 'Target minutes'
            : metric === 'variety'
              ? 'Target activities'
              : 'Target sessions'}
          <input
            key={metric}
            name="target"
            type="number"
            min="1"
            max={
              metric === 'variety'
                ? Object.keys(activityTypes).length
                : metric === 'minutes'
                  ? 10080
                  : 100
            }
            defaultValue={metric === 'minutes' ? 300 : metric === 'variety' ? 4 : 3}
            required
          />
        </label>
        <button className="primary-button" type="submit">
          Add goal
          <Icon name="plus" size={19} />
        </button>
      </form>
    </Sheet>
  )
}

export function PlanDialog({
  weekStart,
  selectedDate,
  activities,
  onSelect,
  onActivity,
  onAdd,
  onClose,
  timeFormat,
  favoriteSports = [],
  sportPictures,
  deletedActivity,
  onUndoDelete,
}) {
  const { activityTypes } = useSports()
  const quickAddSports = validFavoriteSports(favoriteSports, activityTypes).slice(0, 3)

  // Moving the selected day by a whole week keeps the same weekday highlighted.
  function changeWeek(offset) {
    onSelect(dateAtOffset(selectedDate, offset))
  }

  return (
    <Sheet title="Your week, your way." onClose={onClose}>
      {deletedActivity && onUndoDelete && (
        <div className="calendar-deleted-banner" role="status">
          <p>Activity deleted.</p>
          <button type="button" onClick={onUndoDelete}>
            <Icon name="rotate-ccw" size={17} />
            Undo
          </button>
        </div>
      )}
      <div className="plan-week-heading">
        <button
          className="icon-button previous-week"
          onClick={() => changeWeek(-7)}
          aria-label="Previous week"
        >
          <Icon name="chevron-right" size={20} />
        </button>
        <p>{formatWeekRange(weekStart)}</p>
        <button className="icon-button" onClick={() => changeWeek(7)} aria-label="Next week">
          <Icon name="chevron-right" size={20} />
        </button>
      </div>
      <WeekDays {...{ weekStart, selectedDate, activities, onSelect }} />
      {quickAddSports.length > 0 && (
        <div className="plan-favorites" aria-label="Favorite sports">
          {quickAddSports.map((type) => (
            <button
              className="plan-favorite"
              key={type}
              onClick={() => onAdd(selectedDate, type)}
              aria-label={`Add ${activityTypes[type].label} on ${selectedDate}`}
            >
              {sportPictures?.[type] ? (
                <SportPicture
                  sport={activityTypes[type]}
                  picture={sportPictures[type]}
                  size={26}
                />
              ) : (
                <Icon name={activityTypes[type].icon} size={22} />
              )}
              <span className="plan-favorite-label">{activityTypes[type].label}</span>
              <Icon name="plus" size={15} />
            </button>
          ))}
        </div>
      )}
      <div className="plan-list">
        {weekDays(weekStart).map((day) => {
          const dayActivities = activities
            .filter((activity) => activity.date === day.date)
            .sort((a, b) => a.time.localeCompare(b.time))
          return (
            <div className="plan-day" key={day.date}>
              <h3>
                {day.longDay} <span>{day.dayNumber}</span>
              </h3>
              {dayActivities.length ? (
                dayActivities.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onClick={onActivity}
                    timeFormat={timeFormat}
                    sportPictures={sportPictures}
                  />
                ))
              ) : (
                <button className="plan-rest-day" onClick={() => onAdd(day.date)}>
                  Make a little time
                  <Icon name="plus" size={16} />
                </button>
              )}
            </div>
          )
        })}
      </div>
      <button className="primary-button" onClick={() => onAdd(selectedDate)}>
        Add activity
        <Icon name="plus" size={19} />
      </button>
    </Sheet>
  )
}

export function ActivityDetailDialog({
  activity,
  onClose,
  onSetDone,
  onEdit,
  onDelete,
  timeFormat,
  sportPictures,
}) {
  const { activityTypes } = useSports()
  const [feedback, setFeedback] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const cancelDeleteRef = useRef(null)
  const deleteButtonRef = useRef(null)
  const wasConfirmingDelete = useRef(false)
  const type = activityTypes[activity.type]
  const done = activity.logged === true

  useLayoutEffect(() => {
    if (confirmDelete) cancelDeleteRef.current?.focus()
    else if (wasConfirmingDelete.current) deleteButtonRef.current?.focus({ preventScroll: true })
    wasConfirmingDelete.current = confirmDelete
  }, [confirmDelete])

  function changeStatus() {
    const updated = onSetDone(activity, !done)
    setFeedback(
      updated
        ? done
          ? 'Marked as upcoming. You can mark it done when you finish.'
          : 'Activity marked as done. Nice work!'
        : 'Could not update this activity. Please try again.',
    )
  }

  function deleteActivity() {
    const deleted = onDelete(activity)
    if (!deleted) setDeleteError('Could not delete this activity. Please try again.')
  }

  return (
    <Sheet title={type.label} onClose={onClose}>
      <div className="activity-detail-icon" style={{ color: type.color }}>
        {sportPictures?.[activity.type] ? (
          <SportPicture sport={type} picture={sportPictures[activity.type]} size={90} />
        ) : (
          <Icon name={type.icon} size={58} />
        )}
      </div>
      <p className="detail-date">
        {new Date(`${activity.date}T12:00:00`).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
      <p className={`detail-status ${done ? 'detail-status-done' : ''}`}>
        <Icon name={done ? 'check' : 'calendar'} size={15} />
        {done ? 'Done' : 'Upcoming'}
      </p>
      <dl className="detail-list">
        <div>
          <dt>Start time</dt>
          <dd>{formatTime(activity.time, timeFormat)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{activity.duration} minutes</dd>
        </div>
        <div>
          <dt>Your rhythm</dt>
          <dd>{activity.pace}</dd>
        </div>
      </dl>
      {confirmDelete ? (
        <section className="calendar-delete-confirm" aria-labelledby="calendar-delete-title">
          <h3 id="calendar-delete-title">Delete this activity?</h3>
          <p>This removes this {type.label} session from your calendar. Your activity and favorites stay saved.</p>
          <div className="calendar-delete-actions">
            <button
              ref={cancelDeleteRef}
              className="calendar-edit-button"
              type="button"
              onClick={() => {
                setConfirmDelete(false)
                setDeleteError('')
              }}
            >
              Cancel
            </button>
            <button className="calendar-delete-button" type="button" onClick={deleteActivity}>
              Delete activity
            </button>
          </div>
          <p className="calendar-delete-error" role="alert">{deleteError}</p>
        </section>
      ) : (
        <div className="calendar-detail-actions">
          <button
            className={done ? 'detail-status-button' : 'primary-button'}
            type="button"
            onClick={changeStatus}
          >
            {done ? 'Mark as upcoming' : 'Mark as done'}
            <Icon name={done ? 'rotate-ccw' : 'check'} size={19} />
          </button>
          <div className="calendar-edit-actions">
            <button className="calendar-edit-button" type="button" onClick={() => onEdit(activity)}>
              <Icon name="edit" size={18} />
              Edit activity
            </button>
            <button
              ref={deleteButtonRef}
              className="calendar-delete-button"
              type="button"
              onClick={() => {
                setFeedback('')
                setConfirmDelete(true)
              }}
            >
              <Icon name="minus-circle" size={18} />
              Delete activity
            </button>
          </div>
        </div>
      )}
      <p className="detail-status-feedback" role="status">{feedback}</p>
    </Sheet>
  )
}

export function GoalsDialog({ goals, summary, onAdd, onClose }) {
  return (
    <Sheet title="Small goals. Real progress." onClose={onClose}>
      <p className="sheet-description">A little closer, one day at a time.</p>
      <GoalRows {...{ goals, summary }} />
      <button className="primary-button" onClick={onAdd}>
        Add goal
        <Icon name="plus" size={19} />
      </button>
    </Sheet>
  )
}

export function ActivityDialog({ summary, dailyLog, units, onClose }) {
  return (
    <Sheet title="A week in motion" onClose={onClose}>
      <div className="expanded-summary">
        <ActivityChart summary={summary} />
        <p>
          <strong>{formatDuration(summary.totalMinutes)}</strong> of movement this week
        </p>
      </div>
      <DailyLogSummary log={dailyLog} units={units} embedded />
      <dl className="detail-list">
        {summary.byType.map((type) => (
          <div key={type.type}>
            <dt>
              <span className="legend-dot" style={{ background: type.color }} />
              {type.label}
              <small>
                {type.sessions} {type.sessions === 1 ? 'session' : 'sessions'}
              </small>
            </dt>
            <dd>{formatDuration(type.minutes)}</dd>
          </div>
        ))}
      </dl>
    </Sheet>
  )
}

export function ProfileDialog({ profileName, onSave, onClose }) {
  return (
    <Sheet title="Your space." onClose={onClose}>
      <p className="sheet-description">Make it feel a little more like you.</p>
      <form
        className="home-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(new FormData(event.currentTarget).get('name').trim())
        }}
      >
        <label>
          Display name
          <input
            name="name"
            defaultValue={profileName}
            maxLength="40"
            pattern=".*\S.*"
            required
            autoComplete="nickname"
          />
        </label>
        <button className="primary-button" type="submit">
          Save profile
          <Icon name="check" size={19} />
        </button>
      </form>
    </Sheet>
  )
}
