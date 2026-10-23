import Icon from '../../components/Icon'
import {
  ACTIVITY_TYPES,
  DEMO_TODAY,
  formatDuration,
  formatWeekRange,
  goalProgress,
  weekDays,
} from './homeData'

export function HomeHeader({ profileName, onProfile }) {
  const initials = (
    profileName.trim().length <= 2
      ? profileName
      : profileName
          .trim()
          .split(/\s+/)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
  ).toUpperCase()
  return (
    <header className="home-header" id="home">
      <div className="brand-row">
        <a className="brand" href="#home" aria-label="Progressa home">
          Progressa
        </a>
        <button className="profile-button" onClick={onProfile} aria-label="Open your profile">
          {initials}
        </button>
      </div>
      <div className="welcome">
        <h1>Make time for what moves you.</h1>
        <p>Your goals. Your rhythm.</p>
      </div>
    </header>
  )
}

export function WeekDays({ weekStart, selectedDate, activities, onSelect }) {
  return (
    <div className="week-days" aria-label="Choose a day">
      {weekDays(weekStart).map((day) => {
        const types = [
          ...new Set(
            activities
              .filter((activity) => activity.date === day.date)
              .map((activity) => activity.type),
          ),
        ]
        return (
          <button
            className={`day-button${selectedDate === day.date ? ' is-selected' : ''}`}
            key={day.date}
            onClick={() => onSelect(day.date)}
            aria-label={`${day.longDay}, ${day.dayNumber} ${new Date(`${day.date}T12:00:00`).toLocaleDateString('en-GB', { month: 'long' })}${day.date === DEMO_TODAY ? ', today' : ''}`}
            aria-pressed={selectedDate === day.date}
          >
            <span className="day-name">{day.day}</span>
            <span className="day-number">{day.dayNumber}</span>
            <span className="day-dots" aria-hidden="true">
              {types.map((type) => (
                <span key={type} style={{ background: ACTIVITY_TYPES[type].color }} />
              ))}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function ActivityRow({ activity, onClick, dayLabel }) {
  const type = ACTIVITY_TYPES[activity.type]
  return (
    <button
      className="scheduled-activity"
      onClick={() => onClick(activity)}
      aria-label={`View ${type.label}, ${activity.time}, ${activity.duration} minutes`}
    >
      <Icon
        name={type.icon}
        size={36}
        className={`activity-icon activity-icon--${activity.type}`}
      />
      <span className="scheduled-copy">
        {dayLabel && <span className="activity-eyebrow">{dayLabel}</span>}
        <span className="activity-name">{type.label}</span>
        <span className="activity-meta">
          {activity.time} · {activity.duration} min · {activity.pace}
        </span>
      </span>
      <span className="activity-arrow">
        <Icon name="arrow-right" size={18} />
      </span>
    </button>
  )
}

export function WeekCard({
  weekStart,
  selectedDate,
  activities,
  onSelect,
  onPlan,
  onActivity,
  onAdd,
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
      <div className="card-heading">
        <div>
          <h2 id="week-title">This week, your way</h2>
          <p className="week-range">{formatWeekRange(weekStart)}</p>
        </div>
        <button
          className="icon-button week-link"
          onClick={onPlan}
          aria-label="View your weekly plan"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </div>
      <WeekDays {...{ weekStart, selectedDate, activities, onSelect }} />
      <div className="scheduled-list" aria-live="polite">
        {selectedActivities.length ? (
          selectedActivities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onClick={onActivity}
              dayLabel={dayLabel}
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
                style={{ width: `${progress.percent}%` }}
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
        <button className="icon-button small-add" onClick={onAdd} aria-label="Add a goal">
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
            {summary.byType.map((type) => (
              <div key={type.type}>
                <dt>
                  <span className="legend-dot" style={{ background: type.color }} />
                  {type.label}
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
            aria-label="Add an activity"
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
