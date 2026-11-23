import { useEffect, useState } from 'react'
import { Bar, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMinutes } from './activityStats'
import SportBreakdown from './SportBreakdown'

const METRICS = [
  { id: 'sessions', label: 'Sessions' },
  { id: 'minutes', label: 'Time' },
]
const TICK_STEPS = {
  sessions: [1, 2, 5, 10, 20],
  minutes: [30, 60, 120, 180, 300, 600, 1200],
}

function axisTicks(max, metric) {
  const steps = TICK_STEPS[metric]
  const step = steps.find((candidate) => max / candidate <= 4) ?? steps[steps.length - 1] * 2
  const top = Math.max(1, Math.ceil(max / step)) * step
  return Array.from({ length: top / step + 1 }, (_, index) => index * step)
}

function formatTick(value, metric) {
  if (metric === 'sessions' || value === 0) return String(value)
  if (value < 60) return `${value} min`
  return `${Number((value / 60).toFixed(1))} h`
}

function formatAmount(value, metric) {
  return metric === 'sessions' ? String(value) : formatMinutes(value)
}

function WeekTooltip({ active, payload, label, series, metric }) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((item) => item.dataKey !== 'total' && item.value > 0)
  const total = rows.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="activity-tooltip">
      <p className="activity-tooltip-title">
        Week {label.slice(1)} · {payload[0].payload.range}
      </p>
      {rows.map((item) => (
        <p className="activity-tooltip-row" key={item.dataKey}>
          <span className="activity-swatch" style={{ background: item.color }} />
          {series.find((entry) => entry.type === item.dataKey)?.label}
          <span>{formatAmount(item.value, metric)}</span>
        </p>
      ))}
      <p className="activity-tooltip-total">
        Total <span>{formatAmount(total, metric)}</span>
      </p>
    </div>
  )
}

export default function TrainingChart({
  weeks,
  series,
  sports,
  metric,
  onMetricChange,
  monthTitle,
}) {
  const [tooltipHidden, setTooltipHidden] = useState(false)
  const total = metric === 'sessions' ? 'totalSessions' : 'totalMinutes'
  const data = weeks.map((week) => ({
    label: week.label,
    range: week.range,
    total: week[total],
    ...week[metric],
  }))
  // On a touch screen there is no hover, so the tooltip opens on tap and stays until the next tap.
  const tooltipTrigger = window.matchMedia('(hover: none)').matches ? 'click' : 'hover'

  useEffect(() => {
    if (tooltipTrigger !== 'click') return

    function onPointerDown(event) {
      setTooltipHidden(!event.target.closest('.recharts-bar-rectangle'))
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [tooltipTrigger])

  function changeMetric(id) {
    setTooltipHidden(true)
    onMetricChange(id)
  }
  const ticks = axisTicks(Math.max(0, ...weeks.map((week) => week[total])), metric)
  const title = metric === 'sessions' ? 'Sessions per week' : 'Training time per week'

  return (
    <section className="home-card" aria-labelledby="training-chart-title">
      <h2 id="training-chart-title">{title}</h2>
      <p className="activity-note">{title}, split by sport</p>

      <div className="activity-toggle" role="group" aria-label="Show chart by">
        {METRICS.map(({ id, label }) => (
          <button
            key={id}
            className={`activity-toggle-button${metric === id ? ' is-selected' : ''}`}
            aria-pressed={metric === id}
            onClick={() => changeMetric(id)}
          >
            {label}
          </button>
        ))}
      </div>

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
          <ComposedChart data={data} margin={{ top: 20, right: 4, left: 0, bottom: 0 }} accessibilityLayer={false}>
            <XAxis dataKey="label" interval={0} tickLine={false} axisLine={{ stroke: '#dfe3da' }} fontSize={11} />
            <YAxis
              ticks={ticks}
              domain={[0, ticks[ticks.length - 1]]}
              tickFormatter={(value) => formatTick(value, metric)}
              tickLine={false}
              axisLine={false}
              width={44}
              fontSize={11}
            />
            <Tooltip
              trigger={tooltipTrigger}
              active={tooltipHidden ? false : undefined}
              content={<WeekTooltip series={series} metric={metric} />}
              cursor={{ fill: '#f0f2ed' }}
            />
            {series.map((item) => (
              <Bar key={item.type} dataKey={item.type} stackId="week" fill={item.color} maxBarSize={44} />
            ))}
            {/* Invisible line through the top of each stack, only there to carry the total label. */}
            <Line dataKey="total" stroke="none" dot={false} activeDot={false} isAnimationActive={false} legendType="none">
              <LabelList
                dataKey="total"
                position="top"
                fontSize={11}
                formatter={(value) => (value > 0 ? formatAmount(value, metric) : '')}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <SportBreakdown sports={sports} metric={metric} />

      <div className="activity-sr-only">
        <table>
          <caption>
            {title}, {monthTitle}
          </caption>
          <thead>
            <tr>
              <th scope="col">Week</th>
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
                <th scope="row">
                  {week.label}, {week.range}
                </th>
                {series.map((item) => (
                  <td key={item.type}>{formatAmount(week[metric][item.type] ?? 0, metric)}</td>
                ))}
                <td>{formatAmount(week[total], metric)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
