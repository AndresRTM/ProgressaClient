import { compareValues, formatMinutes } from './activityStats'

function Change({ direction, difference, format }) {
  if (direction === 'same') {
    return <p className="activity-kpi-change is-same">Same as last month</p>
  }

  return (
    <p className={`activity-kpi-change is-${direction}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={direction === 'up' ? 'M12 19V5m-6 6 6-6 6 6' : 'M12 5v14m-6-6 6 6 6-6'} />
      </svg>
      {direction === 'up' ? '+' : '−'}
      {format(difference)} vs last month
    </p>
  )
}

function Kpi({ label, value, current, previous, format }) {
  const { difference, direction } = compareValues(current, previous)

  return (
    <section className="home-card activity-kpi" aria-label={label}>
      <p className="activity-kpi-label">{label}</p>
      <p className="activity-kpi-value">{value}</p>
      <Change direction={direction} difference={difference} format={format} />
    </section>
  )
}

export default function ActivityKpis({ current, previous }) {
  return (
    <div className="activity-kpis">
      <Kpi
        label="Training time"
        value={formatMinutes(current.totalMinutes)}
        current={current.totalMinutes}
        previous={previous.totalMinutes}
        format={formatMinutes}
      />
      <Kpi
        label="Sessions"
        value={String(current.sessions)}
        current={current.sessions}
        previous={previous.sessions}
        format={(count) => String(Math.abs(count))}
      />
    </div>
  )
}
