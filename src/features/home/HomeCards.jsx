import Icon from '../../components/Icon'
import SportPicture from '../settings/SportPicture'
import { useSports } from '../activities/useSports'
import { formatTime } from '../settings/formatTime'
import {
  DEMO_TODAY,
  formatDuration,
  formatWeekRange,
  goalProgress,
  profileInitials,
  weekDays,
} from './homeData'

export function HomeHeader({
  profileName,
  onProfile,
  title = 'Make time for what moves you.',
  subtitle = 'Your goals. Your rhythm.',
}) {
  return (
    <header className="home-header" id="home">
      <div className="brand-row">
        <a className="brand" href="#home" aria-label="Progressa home">
          Progressa
        </a>
        <button
          className="profile-button"
          onClick={onProfile}
          aria-label="Open settings"
          data-settings-trigger
        >
          {profileInitials(profileName)}
        </button>
      </div>
      <div className="welcome">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  )
}

export function WeekDays({ weekStart, selectedDate, activities, onSelect }) {
  const { activityTypes } = useSports()
  return (
    <div className="week-days" aria-label="Choose a day">
      {weekDays(weekStart).map((day) => {
        const scheduled = activities.filter((activity) => activity.date === day.date)
        const doneCount = scheduled.filter((activity) => activity.logged).length
        const types = [...new Set(scheduled.map((activity) => activity.type))]
        return (
          <button
            className={`day-button${selectedDate === day.date ? ' is-selected' : ''}`}
            key={day.date}
            onClick={() => onSelect(day.date)}
            aria-label={`${day.longDay}, ${day.dayNumber} ${new Date(`${day.date}T12:00:00`).toLocaleDateString('en-GB', { month: 'long' })}${day.date === DEMO_TODAY ? ', today' : ''}, ${scheduled.length - doneCount} upcoming, ${doneCount} done`}
            aria-pressed={selectedDate === day.date}
          >
            <span className="day-name">{day.day}</span>
            <span className="day-number">{day.dayNumber}</span>
            <span className="day-dots" aria-hidden="true">
              {types.map((type) => (
                <span key={type} style={{ background: activityTypes[type]?.color }} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function ActivityRow({ activity, onClick, dayLabel, timeFormat, sportPictures }) {
  const { activityTypes } = useSports()
  const type = activityTypes[activity.type]
  return (
    <button
      className={`scheduled-activity${activity.logged ? ' is-completed' : ''}`}
      onClick={() => onClick(activity)}
      aria-label={`View ${type.label}, ${activity.logged ? 'done' : 'upcoming'}, ${formatTime(activity.time, timeFormat)}, ${activity.duration} minutes`}
    >
      {sportPictures?.[activity.type] ? (
        <SportPicture sport={type} picture={sportPictures[activity.type]} size={40} />
      ) : (
        <Icon
          name={type.icon}
          size={36}
          className={`activity-icon activity-icon--${activity.type}`}
          style={{ '--sport-color': type.color }}
        />
      )}
      <span className="scheduled-copy">
        <span className="activity-eyebrow">
          {dayLabel ? `${dayLabel} · ` : ''}{activity.logged ? 'Done' : 'Upcoming'}
        </span>
        <span className="activity-name">{type.label}</span>
        <span className="activity-meta">
          {formatTime(activity.time, timeFormat)} · {activity.duration} min · {activity.pace}
        </span>
      </span>
      <span className={`activity-arrow${activity.logged ? ' is-done' : ''}`}>
        <Icon name={activity.logged ? 'check' : 'arrow-right'} size={18} />
      </span>
    </button>
  )
}

function weekTitle(weekOffset, thisWeekTitle) {
  if (weekOffset === 0) return thisWeekTitle
  if (weekOffset === 1) return 'Next week'
  if (weekOffset === -1) return 'Last week'
  return weekOffset > 0 ? `In ${weekOffset} weeks` : `${-weekOffset} weeks ago`
}

export function WeekHeading({ id, thisWeekTitle, weekStart, weekOffset, onChangeWeek, onThisWeek }) {
  return (
    <div className="card-heading">
      <div>
        <h2 id={id}>{weekTitle(weekOffset, thisWeekTitle)}</h2>
        <div className="week-range-row">
          <p className="week-range">{formatWeekRange(weekStart)}</p>
          {weekOffset !== 0 && (
            <button className="back-to-this-week" onClick={onThisWeek}>
              <Icon name="rotate-ccw" size={12} />
              Back to this week
            </button>
          )}
        </div>
      </div>
      <div className="week-arrows">
        <button
          className="icon-button round-button previous-week"
          onClick={() => onChangeWeek(-1)}
          aria-label="Previous week"
        >
          <Icon name="chevron-right" size={16} />
        </button>
        <button
          className="icon-button round-button"
          onClick={() => onChangeWeek(1)}
          aria-label="Next week"
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  )
}

export function WeekCard({
  weekStart,
  weekOffset,
  selectedDate,
  activities,
  onSelect,
  onChangeWeek,
  onThisWeek,
  onActivity,
  onAdd,
  timeFormat,
  sportPictures,
}) {
  const selectedActivities = activities
    .filter((activity) => activity.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))
  const dayLabel =
    selectedDate === DEMO_TODAY
      ? 'Today'
      : new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long' })
  return (
    <section className="home-card week-card" aria-labelledby="week-title" id="week">
      <WeekHeading
        id="week-title"
        thisWeekTitle="This week, your way"
        {...{ weekStart, weekOffset, onChangeWeek, onThisWeek }}
      />
      <WeekDays {...{ weekStart, selectedDate, activities, onSelect }} />
      <div className="scheduled-list" aria-live="polite">
        {selectedActivities.length ? (
          selectedActivities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onClick={onActivity}
              dayLabel={dayLabel}
              timeFormat={timeFormat}
              sportPictures={sportPictures}
            />
          ))
        ) : (
          <button className="empty-day" onClick={onAdd}>
            <span>
              <strong>A little room to move.</strong>
              <span>Plan something that feels good.</span>
            </span>
            <Icon name="plus" size={22} />
          </button>
        )}
      </div>
    </section>
  )
}

export function GoalRows({ goals, summary }) {
  const { activityTypes } = useSports()
  return (
    <div className="goal-list">
      {goals.map((goal) => {
        const progress = goalProgress(goal, summary)
        return (
          <div className="goal-row" key={goal.id}>
            <div className="goal-label">
              <span>{goal.title}</span>
              <span className="goal-value">{progress.valueLabel}</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={goal.title}
              aria-valuenow={progress.current}
              aria-valuemin={0}
              aria-valuemax={Math.max(progress.current, progress.target)}
              aria-valuetext={progress.valueLabel}
            >
              <span
                className={`progress-fill progress-fill--${goal.color}`}
                style={{
                  width: `${progress.percent}%`,
                  background: activityTypes[goal.color]?.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function GoalsCard({ goals, summary, onAdd }) {
  return (
    <section className="home-card goals-card" aria-labelledby="goals-title" id="goals">
      <div className="card-heading">
        <h2 id="goals-title">Small goals. Real progress.</h2>
        <button className="icon-button round-button" onClick={onAdd} aria-label="Add a goal">
          <Icon name="plus" size={18} />
        </button>
      </div>
      <GoalRows {...{ goals, summary }} />
    </section>
  )
}

export function ActivityChart({ summary }) {
  const radius = 34.5
  const circumference = 2 * Math.PI * radius
  const sessionLabel = summary.sessions === 1 ? 'session' : 'sessions'
  return (
    <div
      className="activity-chart"
      role="img"
      aria-label={`${summary.sessions} ${sessionLabel}, ${formatDuration(summary.totalMinutes)} total this week`}
    >
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--track)" strokeWidth="7" />
        {summary.byType.map((type, index) => {
          if (!type.minutes) return null
          const length = (type.minutes / summary.totalMinutes) * circumference
          const start =
            (summary.byType.slice(0, index).reduce((total, entry) => total + entry.minutes, 0) /
              summary.totalMinutes) *
            circumference
          return (
            <circle
              key={type.type}
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={type.color}
              strokeWidth="7"
              strokeDasharray={`${Math.max(0, length - 1.5)} ${circumference}`}
              strokeDashoffset={-start}
              transform="rotate(-90 40 40)"
            />
          )
        })}
      </svg>
      <span className="donut-center">
        <strong>{summary.sessions}</strong>
        <span>{sessionLabel}</span>
      </span>
    </div>
  )
}

export function ActivitySummary({ summary }) {
  return (
    <section className="home-card summary-card" aria-labelledby="summary-title" id="activity">
      <h2 id="summary-title">A week in motion</h2>
      <div className="summary-content">
        <ActivityChart summary={summary} />
        <div className="summary-details">
          <p className="total-time">
            {formatDuration(summary.totalMinutes)} <span>total</span>
          </p>
          <dl className="activity-legend">
            {summary.byType
              .filter((type) => type.minutes > 0)
              .map((type) => (
                <div key={type.type}>
                  <dt>
                    <span className="legend-dot" style={{ background: type.color }} />
                    <span>{type.label}</span>
                  </dt>
                  <dd>{formatDuration(type.minutes)}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export function BottomNav({ activeTab, onNavigate, onAdd }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'plan', label: 'Plan', icon: 'calendar' },
    { id: 'add' },
    { id: 'goals', label: 'Goals', icon: 'target' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
  ]
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) =>
        item.id === 'add' ? (
          <button
            className="quick-add"
            data-dialog-fallback
            key={item.id}
            onClick={onAdd}
            aria-label="Log today"
          >
            <Icon name="plus" size={27} />
          </button>
        ) : (
          <button
            className={`nav-item${activeTab === item.id ? ' is-active' : ''}`}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="nav-icon">
              <Icon name={item.icon} size={21} />
            </span>
            <span>{item.label}</span>
          </button>
        ),
      )}
    </nav>
  )
}
