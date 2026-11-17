import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMinutes } from './activityStats'

const MODES = [
  { id: 'month', label: 'This month' },
  { id: 'full', label: 'Full weeks' },
]
const TICK_STEPS = [30, 60, 120, 180, 300, 600, 1200]

function axisTicks(maxMinutes) {
  const step = TICK_STEPS.find((candidate) => maxMinutes / candidate <= 4) ?? 2400
  const top = Math.max(1, Math.ceil(maxMinutes / step)) * step
  return Array.from({ length: top / step + 1 }, (_, index) => index * step)
}

function formatTick(minutes) {
  if (minutes === 0) return '0'
  if (minutes < 60) return `${minutes} min`
  return `${Number((minutes / 60).toFixed(1))} h`
}

function WeekTooltip({ active, payload, label, series }) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((item) => item.value > 0)
  const total = rows.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="activity-tooltip">
      <p className="activity-tooltip-title">Week of {label}</p>
      {rows.map((item) => (
        <p className="activity-tooltip-row" key={item.dataKey}>
          <span className="activity-swatch" style={{ background: item.color }} />
          {series.find((entry) => entry.type === item.dataKey)?.label}
          <span>{formatMinutes(item.value)}</span>
        </p>
      ))}
      <p className="activity-tooltip-total">
        Total <span>{formatMinutes(total)}</span>
      </p>
    </div>
  )
}

export default function TrainingChart({ weeks, series, mode, onModeChange, monthTitle }) {
  const data = weeks.map((week) => ({ label: week.label, ...week.values }))
  const ticks = axisTicks(Math.max(0, ...weeks.map((week) => week.totalMinutes)))

  return (
    <section className="home-card" aria-labelledby="training-chart-title">
      <h2 id="training-chart-title">Training time per week</h2>
      <p className="activity-note">Time per week, split by sport</p>

      <div className="activity-toggle" role="group" aria-label="Weeks shown">
        {MODES.map(({ id, label }) => (
          <button
            key={id}
            className={`activity-toggle-button${mode === id ? ' is-selected' : ''}`}
            aria-pressed={mode === id}
            onClick={() => onModeChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === 'full' && (
        <p className="activity-note">
          Full weeks include days from the neighbouring months, so the bars can add up to more than the
          month total.
        </p>
      )}

      <ul className="training-legend">
        {series.map((item) => (
          <li key={item.type}>
            <span className="activity-swatch" style={{ background: item.color }} />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="training-plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} accessibilityLayer={false}>
            <XAxis dataKey="label" interval={0} tickLine={false} axisLine={{ stroke: '#dfe3da' }} fontSize={11} />
            <YAxis
              ticks={ticks}
              domain={[0, ticks[ticks.length - 1]]}
              tickFormatter={formatTick}
              tickLine={false}
              axisLine={false}
              width={56}
              fontSize={11}
            />
            <Tooltip content={<WeekTooltip series={series} />} cursor={{ fill: '#f0f2ed' }} />
            {series.map((item) => (
              <Bar key={item.type} dataKey={item.type} stackId="week" fill={item.color} maxBarSize={44} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="activity-sr-only">
        <table>
          <caption>Training time per week, {monthTitle}</caption>
          <thead>
            <tr>
              <th scope="col">Week starting</th>
              {series.map((item) => (
                <th scope="col" key={item.type}>
                  {item.label}
                </th>
              ))}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week.start}>
                <th scope="row">{week.label}</th>
                {series.map((item) => (
                  <td key={item.type}>{formatMinutes(week.values[item.type] ?? 0)}</td>
                ))}
                <td>{formatMinutes(week.totalMinutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
