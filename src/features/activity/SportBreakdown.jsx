import { formatMinutes } from './activityStats'

function formatValue(sport, metric) {
  if (metric === 'minutes') return formatMinutes(sport.minutes)
  return `${sport.sessions} ${sport.sessions === 1 ? 'session' : 'sessions'}`
}

export default function SportBreakdown({ sports, metric }) {
  const sorted = [...sports].sort((a, b) => b[metric] - a[metric])
  const most = Math.max(1, ...sorted.map((sport) => sport[metric]))

  return (
    <div className="sport-breakdown">
      <h3>By sport</h3>
      <ul>
        {sorted.map((sport) => (
          <li key={sport.type}>
            <p className="sport-breakdown-row">
              <span className="activity-swatch" style={{ background: sport.color }} />
              {sport.label}
              <span>{formatValue(sport, metric)}</span>
            </p>
            <div className="sport-breakdown-track">
              <div
                className="sport-breakdown-fill"
                style={{ width: `${(sport[metric] / most) * 100}%`, background: sport.color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
