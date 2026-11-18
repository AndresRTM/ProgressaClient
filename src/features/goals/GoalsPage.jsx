import { useState } from 'react'
import Icon from '../../components/Icon'
import { formatDuration, getToday } from '../home/homeData'
import { deleteGoalFromApi } from '../home/goalsApi'
import { formatPeriod, isReached, splitGoals, statusLabel } from './goalsData'
import './goals.css'

const COLORS = { 1: 'running', 2: 'strength', 3: 'swimming' }

function GoalCard({ goal, today, deleting, onEdit, onRemove }) {
  const hasProgress = Number.isFinite(goal.progress) && goal.target > 0
  const isDuration = goal.metric === 2
  const format = (value) => (isDuration ? formatDuration(value) : value)
  const valueLabel = hasProgress
    ? `${format(goal.progress)}/${format(goal.target)}`
    : `Target: ${format(goal.target)}`
  const period = formatPeriod(goal)

  return (
    <article className="goal-card">
      <div className="goal-card-top">
        <h3>{goal.title}</h3>
        <span className="goal-value">{valueLabel}</span>
      </div>

      {hasProgress && (
        <div
          className="progress-track"
          role="progressbar"
          aria-label={goal.title}
          aria-valuemin={0}
          aria-valuemax={goal.target}
          aria-valuenow={Math.min(goal.progress, goal.target)}
          aria-valuetext={valueLabel}
        >
          <span
            className={`progress-fill progress-fill--${COLORS[goal.metric]}`}
            style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
          />
        </div>
      )}

      <p className="goal-card-meta">
        {period && <span>{period}</span>}
        <span className={isReached(goal) ? 'goal-status goal-status--reached' : 'goal-status'}>
          {statusLabel(goal, today)}
        </span>
      </p>

      <div className="goal-card-actions">
        <button type="button" onClick={() => onEdit(goal)}>
          <Icon name="edit" size={16} />
          Edit
        </button>
        <button type="button" onClick={() => onRemove(goal)} disabled={deleting}>
          <Icon name="trash" size={16} />
          Remove
        </button>
      </div>
    </article>
  )
}

function GoalSection({ title, goals, ...cardProps }) {
  if (goals.length === 0) return null

  return (
    <section className="home-card" aria-label={title}>
      <h2>{title}</h2>
      <div className="goal-card-list">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} {...cardProps} />
        ))}
      </div>
    </section>
  )
}

export default function GoalsPage({ goals, goalsError, onAdd, onEdit, onRemoved }) {
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const today = getToday()
  const { active, finished } = splitGoals(goals ?? [], today)
  const reached = (goals ?? []).filter(isReached).length

  async function removeGoal(goal) {
    if (!window.confirm(`Remove "${goal.title}"?`)) return

    setError('')
    setDeleting(true)

    try {
      await deleteGoalFromApi(goal.id)
      onRemoved(goal.id)
    } catch {
      setError('Could not remove the goal. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="home-content" id="main-content" tabIndex={-1}>
      <section className="home-card" aria-labelledby="goals-page-title">
        <div className="card-heading">
          <h2 id="goals-page-title">
            {goals?.length ? `${reached} of ${goals.length} goals reached` : 'Your goals'}
          </h2>
          <button
            className="icon-button round-button"
            type="button"
            onClick={onAdd}
            aria-label="Add a goal"
          >
            <Icon name="plus" size={18} />
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        {goalsError && <p role="alert">{goalsError}</p>}
        {!goalsError && goals === null && <p>Loading goals…</p>}
        {goals?.length === 0 && <p className="goals-empty">No goals yet. Add one to get started.</p>}
      </section>

      <GoalSection
        title="In progress"
        goals={active}
        today={today}
        deleting={deleting}
        onEdit={onEdit}
        onRemove={removeGoal}
      />
      <GoalSection
        title="Finished"
        goals={finished}
        today={today}
        deleting={deleting}
        onEdit={onEdit}
        onRemove={removeGoal}
      />
    </main>
  )
}
