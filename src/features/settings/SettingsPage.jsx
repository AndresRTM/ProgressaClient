import { useLayoutEffect, useRef } from 'react'
import Icon from '../../components/Icon'
import LoggingSettings from './LoggingSettings'
import NotificationsSettings from './NotificationsSettings'
import SportSettings from './SportSettings'
import UnitsSettings from './UnitsSettings'
import './settings.css'

const pageHeadings = {
  settings: ['Settings'],
  'settings/logging': ['Logging', 'Choose what shows up when you tap + to log your day.'],
  'settings/sports': ['Activity', 'They show first when you tap + to log a workout.'],
  'settings/notifications': ['Notifications', 'Gentle nudges. Nothing more than you ask for.'],
  'settings/units': ['Units', 'Used everywhere: logging, goals and Activity.'],
}

function MenuRow({ icon, title, description, onClick }) {
  return (
    <button className="settings-menu-row" onClick={onClick}>
      <span className="settings-menu-icon">
        <Icon name={icon} size={22} />
      </span>
      <span className="settings-menu-copy">
        <span>{title}</span>
        <small>{description}</small>
      </span>
      <Icon name="chevron-right" size={18} />
    </button>
  )
}

export default function SettingsPage({
  page,
  navigate,
  onBack,
  profileName,
  preferences,
  pictureStorage,
  onProfile,
  onGoals,
}) {
  const {
    settings,
    updateNotifications,
    updateUnits,
    updateLogging,
    updateTarget,
    setFavoriteSports,
  } = preferences
  const headingRef = useRef(null)
  const [title, subtitle] = pageHeadings[page] || pageHeadings.settings
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
  const metric =
    settings.units.distance === 'km' &&
    settings.units.weight === 'kg' &&
    settings.units.height === 'cm'
  const imperial =
    settings.units.distance === 'mi' &&
    settings.units.weight === 'lb' &&
    settings.units.height === 'ft'
  let measurementSystem = 'Custom'
  if (metric) measurementSystem = 'Metric'
  if (imperial) measurementSystem = 'Imperial'
  const unitSummary = `${measurementSystem} · ${settings.units.energy === 'kj' ? 'kJ' : 'kcal'}, g, ${settings.units.distance}`

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [page])

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button
          className="settings-back"
          onClick={onBack}
          aria-label={page === 'settings' ? 'Back to home' : 'Go back'}
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <h1 ref={headingRef} tabIndex={-1}>
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <main id="settings-content" tabIndex={-1}>
        {page === 'settings' && (
          <div className="settings-sections">
            <button className="settings-card settings-profile" onClick={onProfile}>
              <span className="settings-avatar">{initials}</span>
              <span className="settings-menu-copy">
                <strong>Your profile</strong>
                <small>Name, photo and age</small>
              </span>
              <Icon name="chevron-right" size={18} />
            </button>
            <section className="settings-card settings-menu" aria-labelledby="your-app">
              <h2 className="settings-section-label" id="your-app">
                Your app
              </h2>
              <MenuRow
                icon="target"
                title="Goals"
                description="Weekly targets for time and sessions"
                onClick={onGoals}
              />
              <MenuRow
                icon="clipboard"
                title="Logging"
                description="Training · Calories · Protein · Sleep"
                onClick={() => navigate('settings/logging')}
              />
              <MenuRow
                icon="star"
                title="Favorite sports"
                description={`${settings.favoriteSports.length} selected`}
                onClick={() => navigate('settings/sports')}
              />
              <MenuRow
                icon="bell"
                title="Notifications"
                description={
                  settings.notifications.upcoming ||
                  settings.notifications.daily ||
                  settings.notifications.weekly ||
                  settings.notifications.goalReached ||
                  settings.notifications.missed
                    ? 'Reminders on'
                    : 'Reminders off'
                }
                onClick={() => navigate('settings/notifications')}
              />
              <MenuRow
                icon="ruler"
                title="Units"
                description={unitSummary}
                onClick={() => navigate('settings/units')}
              />
            </section>
          </div>
        )}
        {page === 'settings/logging' && (
          <LoggingSettings
            value={settings.logging}
            targets={settings.targets}
            units={settings.units}
            favoriteSports={settings.favoriteSports}
            sportPictures={pictureStorage.pictures}
            onChange={updateLogging}
            onTargetChange={updateTarget}
            onFavorites={() => navigate('settings/sports')}
          />
        )}
        {page === 'settings/notifications' && (
          <NotificationsSettings value={settings.notifications} onChange={updateNotifications} />
        )}
        {page === 'settings/sports' && (
          <SportSettings
            value={settings.favoriteSports}
            onChange={setFavoriteSports}
            pictureStorage={pictureStorage}
          />
        )}
        {page === 'settings/units' && (
          <UnitsSettings value={settings.units} onChange={updateUnits} />
        )}
      </main>
    </div>
  )
}
