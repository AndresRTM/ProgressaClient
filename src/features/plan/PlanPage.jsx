import Icon from '../../components/Icon'
import { ActivityRow, WeekDays, WeekHeading } from '../home/HomeCards'
import { dateAtOffset, dayTitle, getToday } from '../home/homeData'
import './plan.css'

function calendarDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`)
}

function byDateAndTime(a, b) {
  return a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
}

export default function PlanPage({
  weekStart,
  weekOffset,
  selectedDate,
  activities,
  timeFormat,
  sportPictures,
  onSelect,
  onChangeWeek,
  onThisWeek,
  onActivity,
  onAdd,
}) {
  const weekEnd = dateAtOffset(weekStart, 7)
  const selected = calendarDate(selectedDate)
  const title = dayTitle(selectedDate)
  const dayActivities = activities.filter((activity) => activity.date === selectedDate).sort(byDateAndTime)
  const comingUp = activities
    .filter((activity) => activity.date > selectedDate && activity.date < weekEnd && !activity.logged)
    .sort(byDateAndTime)

  return (
    <main className="home-content" id="main-content" tabIndex={-1}>
      <section className="home-card" aria-labelledby="plan-week-title">
        <WeekHeading
          id="plan-week-title"
          thisWeekTitle="Your week at a glance"
          {...{ weekStart, weekOffset, onChangeWeek, onThisWeek }}
        />
        <WeekDays {...{ weekStart, selectedDate, activities, onSelect }} />
      </section>

      <section className="home-card" aria-labelledby="plan-day-title">
        <div className="card-heading">
          <h2 id="plan-day-title">{title}</h2>
          <button
            className="icon-button round-button"
            onClick={() => onAdd(selectedDate)}
            aria-label={`Add a session on ${title}`}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
        <div className="scheduled-list" aria-live="polite">
          {dayActivities.length ? (
            dayActivities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onClick={onActivity}
                dayLabel={
                  selectedDate === getToday()
                    ? 'Today'
                    : selected.toLocaleDateString('en-GB', { weekday: 'long' })
                }
                timeFormat={timeFormat}
                sportPictures={sportPictures}
              />
            ))
          ) : (
            <button className="empty-day" onClick={() => onAdd(selectedDate)}>
              <span>
                <strong>A little room to move.</strong>
                <span>Plan something that feels good.</span>
              </span>
              <Icon name="plus" size={22} />
            </button>
          )}
        </div>
      </section>

      <section className="home-card plan-coming-up" aria-labelledby="plan-coming-up-title">
        <h2 id="plan-coming-up-title">{weekOffset === 0 ? 'Coming up' : 'Later this week'}</h2>
        {comingUp.length ? (
          <div className="scheduled-list">
            {comingUp.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                onClick={onActivity}
                dayLabel={calendarDate(activity.date).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                })}
                timeFormat={timeFormat}
                sportPictures={sportPictures}
              />
            ))}
          </div>
        ) : (
          <p className="plan-nothing-planned">Nothing else planned this week.</p>
        )}
      </section>
    </main>
  )
}
