import './notifications.css'

function NotificationSwitch({ label, checked, onChange }) {
  return (
    <button
      className="notif-switch"
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

function ReminderRow({ title, description, checked, onChange, children }) {
  return (
    <div className="notif-row">
      <div className="notif-row-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {children}
      </div>
      <NotificationSwitch label={title} checked={checked} onChange={onChange} />
    </div>
  )
}

function ReminderTime({ label, value, disabled, onChange }) {
  return (
    <input
      className="notif-chip notif-time"
      type="time"
      aria-label={label}
      value={value}
      disabled={disabled}
      required
      onChange={(event) => {
        if (event.target.value) onChange(event.target.value)
      }}
    />
  )
}

export default function NotificationsSettings({ value, onChange }) {
  return (
    <div className="notif-content">
      <section className="settings-card notif-card" aria-labelledby="reminders-heading">
        <h2 className="notif-section-label" id="reminders-heading">
          Reminders
        </h2>
        <div className="notif-reminder-list">
          <ReminderRow
            title="Upcoming session"
            description="Before a planned session"
            checked={value.upcoming}
            onChange={(upcoming) => onChange({ upcoming })}
          >
            <select
              className="notif-chip notif-lead-time"
              aria-label="Upcoming session reminder time"
              value={value.reminderMinutes}
              disabled={!value.upcoming}
              onChange={(event) => onChange({ reminderMinutes: Number(event.target.value) })}
            >
              <option value="0">At start time</option>
              <option value="5">5 min before</option>
              <option value="10">10 min before</option>
              <option value="15">15 min before</option>
              <option value="30">30 min before</option>
              <option value="60">1 hour before</option>
            </select>
          </ReminderRow>
          <ReminderRow
            title="Log your day"
            description="If nothing is logged yet"
            checked={value.daily}
            onChange={(daily) => onChange({ daily })}
          >
            <ReminderTime
              label="Daily reminder time"
              value={value.dailyTime}
              disabled={!value.daily}
              onChange={(dailyTime) => onChange({ dailyTime })}
            />
          </ReminderRow>
          <ReminderRow
            title="Weekly summary"
            description="Your week in motion"
            checked={value.weekly}
            onChange={(weekly) => onChange({ weekly })}
          >
            <div className={`notif-weekly-time${value.weekly ? '' : ' is-disabled'}`}>
              <select
                aria-label="Weekly summary day"
                value={value.weeklyDay}
                disabled={!value.weekly}
                onChange={(event) => onChange({ weeklyDay: Number(event.target.value) })}
              >
                <option value="0">Sun</option>
                <option value="1">Mon</option>
                <option value="2">Tue</option>
                <option value="3">Wed</option>
                <option value="4">Thu</option>
                <option value="5">Fri</option>
                <option value="6">Sat</option>
              </select>
              <ReminderTime
                label="Weekly summary time"
                value={value.weeklyTime}
                disabled={!value.weekly}
                onChange={(weeklyTime) => onChange({ weeklyTime })}
              />
            </div>
          </ReminderRow>
          <ReminderRow
            title="Goal reached"
            description="When you complete a goal"
            checked={value.goalReached}
            onChange={(goalReached) => onChange({ goalReached })}
          />
          <ReminderRow
            title="Missed session"
            description="A soft check-in the next morning"
            checked={value.missed}
            onChange={(missed) => onChange({ missed })}
          >
            <ReminderTime
              label="Missed session reminder time"
              value={value.missedTime}
              disabled={!value.missed}
              onChange={(missedTime) => onChange({ missedTime })}
            />
          </ReminderRow>
        </div>
      </section>

      <section className="settings-card notif-card" aria-labelledby="quiet-hours-heading">
        <h2 className="notif-section-label" id="quiet-hours-heading">
          Quiet hours
        </h2>
        <p className="notif-section-description">No notifications during this time.</p>
        <ReminderRow
          title="Quiet hours"
          description="Every day"
          checked={value.quietHours}
          onChange={(quietHours) => onChange({ quietHours })}
        />
        <div className="notif-quiet-times">
          <label>
            <span>From</span>
            <input
              type="time"
              value={value.quietFrom}
              disabled={!value.quietHours}
              required
              onChange={(event) => {
                if (event.target.value) onChange({ quietFrom: event.target.value })
              }}
            />
          </label>
          <label>
            <span>To</span>
            <input
              type="time"
              value={value.quietTo}
              disabled={!value.quietHours}
              required
              onChange={(event) => {
                if (event.target.value) onChange({ quietTo: event.target.value })
              }}
            />
          </label>
        </div>
      </section>
    </div>
  )
}
