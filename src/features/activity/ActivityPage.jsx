import { useState } from 'react'
import Icon from '../../components/Icon'
import { getToday, profileInitials } from '../home/homeData'
import { addMonths, formatMonthTitle, monthStartOf } from './activityStats'
import './activity.css'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'patterns', label: 'Patterns' },
]

export default function ActivityPage({ profileName, onProfile }) {
  const [tab, setTab] = useState('overview')
  const [month, setMonth] = useState(() => monthStartOf(getToday()))

  function selectTab(id) {
    setTab(id)
    document.getElementById(`activity-tab-${id}`)?.focus()
  }

  function onTabKeyDown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    selectTab(tab === 'overview' ? 'patterns' : 'overview')
  }

  return (
    <>
      <header className="activity-header">
        <div className="brand-row">
          <h1 className="activity-title">Activity</h1>
          <button
            className="profile-button"
            onClick={onProfile}
            aria-label="Open settings"
            data-settings-trigger
          >
            {profileInitials(profileName)}
          </button>
        </div>
      </header>

      <main className="home-content" id="main-content" tabIndex={-1}>
        <div className="activity-tabs" role="tablist" aria-label="Activity views" onKeyDown={onTabKeyDown}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              id={`activity-tab-${id}`}
              className={`activity-tab${tab === id ? ' is-selected' : ''}`}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`activity-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="month-picker">
          <button
            className="icon-button round-button previous-week"
            onClick={() => setMonth(addMonths(month, -1))}
            aria-label="Previous month"
          >
            <Icon name="chevron-right" size={16} />
          </button>
          <p className="month-picker-label" aria-live="polite">
            {formatMonthTitle(month)}
          </p>
          <button
            className="icon-button round-button"
            onClick={() => setMonth(addMonths(month, 1))}
            aria-label="Next month"
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </div>

        <div
          id={`activity-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`activity-tab-${tab}`}
          className="activity-panel"
        >
          {tab === 'patterns' && (
            <section className="home-card">
              <h2>Patterns</h2>
              <p className="activity-note">Patterns are coming soon.</p>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
