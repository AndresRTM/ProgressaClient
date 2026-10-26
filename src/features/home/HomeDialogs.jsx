import { useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import SportPicture from '../settings/SportPicture'
import { formatTime } from '../settings/formatTime'
import { ActivityChart, ActivityRow, GoalRows, WeekDays } from './HomeCards'
import { ACTIVITY_TYPES, dateAtOffset, formatDuration, formatWeekRange, weekDays } from './homeData'

export function AddActivityDialog({ selectedDate, activityType, onSave, onClose }) {
  function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSave({
      type: data.get('type'),
      date: data.get('date'),
      time: data.get('time'),
      duration: Number(data.get('duration')),
      pace: data.get('pace'),
    })
  }
  return (
    <Sheet title="Make a little time." onClose={onClose}>
      <p className="sheet-description">A little movement goes a long way.</p>
      <form className="home-form" onSubmit={submit}>
        <label>
          Activity
          <select name="type" defaultValue={activityType || 'swimming'}>
            {Object.entries(ACTIVITY_TYPES).map(([value, type]) => (
              <option key={value} value={value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" name="date" defaultValue={selectedDate} required />
        </label>
        <div className="form-columns">
          <label>
            Time
            <input type="time" name="time" defaultValue="17:30" required />
          </label>
          <label>
            Duration (min)
            <input type="number" name="duration" min="1" max="600" defaultValue="30" required />
          </label>
        </div>
        <label>
          Pace
          <select name="pace" defaultValue="Easy pace">
            <option>Easy pace</option>
            <option>Steady pace</option>
            <option>A little challenge</option>
          </select>
        </label>
        <button className="primary-button" type="submit">
          Add activity
          <Icon name="plus" size={19} />
        </button>
      </form>
    </Sheet>
  )
}

export function AddGoalDialog({ onSave, onClose }) {
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
              {Object.entries(ACTIVITY_TYPES).map(([value, type]) => (
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
            max={metric === 'variety' ? Object.keys(ACTIVITY_TYPES).length : metric === 'minutes' ? 10080 : 100}
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
  weekStartsOn = 'mon',
  favoriteSports = [],
  sportPictures,
}) {
  const [visibleWeek, setVisibleWeek] = useState(weekStart)
  const quickAddSports = [...new Set(favoriteSports)]
    .filter((type) => Object.hasOwn(ACTIVITY_TYPES, type))
    .slice(0, 3)
  function changeWeek(offset) {
    const nextWeek = dateAtOffset(visibleWeek, offset)
    const selectedDay = new Date(`${selectedDate}T12:00:00`).getDay()
    const weekdayOffset = weekStartsOn === 'sun' ? selectedDay : (selectedDay + 6) % 7
    setVisibleWeek(nextWeek)
    onSelect(dateAtOffset(nextWeek, weekdayOffset))
  }
  return (
    <Sheet title="Your week, your way." onClose={onClose}>
      <div className="plan-week-heading">
        <button
          className="icon-button previous-week"
          onClick={() => changeWeek(-7)}
          aria-label="Previous week"
        >
          <Icon name="chevron-right" size={20} />
        </button>
        <p>{formatWeekRange(visibleWeek)}</p>
        <button className="icon-button" onClick={() => changeWeek(7)} aria-label="Next week">
          <Icon name="chevron-right" size={20} />
        </button>
      </div>
      <WeekDays weekStart={visibleWeek} {...{ selectedDate, activities, onSelect }} />
      {quickAddSports.length > 0 && (
        <div className="plan-favorites" aria-label="Favorite sports">
          {quickAddSports.map((type) => (
            <button
              className="plan-favorite"
              key={type}
              onClick={() => onAdd(selectedDate, type)}
              aria-label={`Add ${ACTIVITY_TYPES[type].label} on ${selectedDate}`}
            >
              {sportPictures?.[type] ? (
                <SportPicture sport={ACTIVITY_TYPES[type]} picture={sportPictures[type]} size={26} />
              ) : (
                <Icon name={ACTIVITY_TYPES[type].icon} size={22} />
              )}
              <span className="plan-favorite-label">{ACTIVITY_TYPES[type].label}</span>
              <Icon name="plus" size={15} />
            </button>
          ))}
        </div>
      )}
      <div className="plan-list">
        {weekDays(visibleWeek).map((day) => {
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

export function ActivityDetailDialog({ activity, onClose, timeFormat, sportPictures }) {
  const type = ACTIVITY_TYPES[activity.type]
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
      <button className="primary-button" onClick={onClose}>
        Sounds good
        <Icon name="check" size={19} />
      </button>
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

export function ActivityDialog({ summary, onClose }) {
  return (
    <Sheet title="A week in motion" onClose={onClose}>
      <div className="expanded-summary">
        <ActivityChart summary={summary} />
        <p>
          <strong>{formatDuration(summary.totalMinutes)}</strong> of movement this week
        </p>
      </div>
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
