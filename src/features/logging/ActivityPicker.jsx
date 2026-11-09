import { useLayoutEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import SportPicture from '../settings/SportPicture'
import { MAX_FAVORITES } from '../settings/settingsData'
import { useSports } from '../activities/useSports'
import { activityNameKey, normalizeActivityName } from '../activities/activityCatalog'
import './activityPicker.css'

export default function ActivityPicker({
  favoriteSports = [],
  sportPictures = {},
  activities = [],
  date,
  heading = 'Favorites',
  onSelect,
  onEditFavorites,
  onFavoriteChange,
  onSearchChange,
  allowCreate = true,
}) {
  const { sports, createSport } = useSports()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const headingRef = useRef(null)
  const activityName = normalizeActivityName(query)
  const exactMatch = sports.some(
    (sport) => activityNameKey(sport.label) === activityNameKey(activityName),
  )
  const favorites = favoriteSports
    .map((id) => sports.find((sport) => sport.id === id))
    .filter(Boolean)
  const results = sports.filter((sport) =>
    `${sport.label} ${sport.category}`
      .toLowerCase()
      .includes(activityName.toLowerCase()),
  )
  const isSearching = searching || query.length > 0

  useLayoutEffect(() => {
    if (!isSearching) headingRef.current?.focus({ preventScroll: true })
  }, [isSearching])

  function startSearch() {
    setSearching(true)
    onSearchChange?.(true)
  }

  function clearSearch() {
    setQuery('')
    setSearching(false)
    setError('')
    onSearchChange?.(false)
  }

  function addOwnActivity() {
    const result = createSport(activityName)
    if (!result.sport) {
      setError(result.error)
      return
    }
    onSelect(result.sport.id)
  }

  function toggleFavorite(id) {
    if (favoriteSports.includes(id))
      onFavoriteChange(favoriteSports.filter((sport) => sport !== id))
    else if (favoriteSports.length < MAX_FAVORITES) onFavoriteChange([...favoriteSports, id])
  }

  return (
    <section className="activity-picker" aria-label="Choose an activity">
      {!isSearching && (
        <>
          <div className="activity-picker-heading">
            <h3 ref={headingRef} tabIndex={-1}>
              {heading}
            </h3>
            {onEditFavorites && (
              <button type="button" onClick={onEditFavorites}>
                Edit<span className="sr-only"> favorite sports</span>
              </button>
            )}
          </div>
          <div className="activity-picker-grid">
            {favorites.map((sport) => {
              const planned = activities.some(
                (activity) =>
                  activity.type === sport.id && activity.date === date && !activity.logged,
              )
              return (
                <button
                  key={sport.id}
                  type="button"
                  className="activity-picker-tile"
                  onClick={() => onSelect(sport.id)}
                  aria-label={`Choose ${sport.label}${planned ? ', planned' : ''}`}
                >
                  {planned && <span className="activity-planned-badge">Planned</span>}
                  <SportPicture sport={sport} picture={sportPictures[sport.id]} size={40} />
                  <span>{sport.label}</span>
                </button>
              )
            })}
          </div>
          {favorites.length === 0 && (
            <p className="activity-no-results">Search below to choose an activity.</p>
          )}
        </>
      )}
      <div className={`activity-picker-search${isSearching ? ' is-searching' : ''}`}>
        <Icon name="search" size={18} />
        <input
          type="search"
          aria-label="Search all sports"
          placeholder="Search all sports"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setError('')
          }}
          onFocus={startSearch}
          autoComplete="off"
        />
        {isSearching && (
          <button
            type="button"
            aria-label={query ? 'Clear activity search' : 'Back to favorite activities'}
            onClick={clearSearch}
          >
            <Icon name="close" size={17} />
          </button>
        )}
      </div>
      {isSearching && (
        <div className="activity-search-results">
          <h3>{query.trim() ? 'Results' : 'All sports'}</h3>
          <ul>
            {results.map((sport) => {
              const favorite = favoriteSports.includes(sport.id)
              return (
                <li key={sport.id}>
                  <button
                    className="activity-result"
                    type="button"
                    onClick={() => onSelect(sport.id)}
                    aria-label={`Choose ${sport.label}`}
                  >
                    <SportPicture sport={sport} picture={sportPictures[sport.id]} size={40} />
                    <span>
                      <strong>{sport.label}</strong>
                      <small>{sport.category}</small>
                    </span>
                  </button>
                  {onFavoriteChange && (
                    <button
                      type="button"
                      className="activity-result-star"
                      aria-label={`${favorite ? 'Remove' : 'Add'} ${sport.label} ${favorite ? 'from' : 'to'} favorites`}
                      aria-pressed={favorite}
                      disabled={!favorite && favoriteSports.length >= MAX_FAVORITES}
                      onClick={() => toggleFavorite(sport.id)}
                    >
                      <Icon name="star" size={22} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
          {results.length === 0 && (
            <p className="activity-no-results" role="status">
              No activities found{allowCreate ? '. Add your own below.' : '.'}
            </p>
          )}
          {allowCreate && activityName && !exactMatch && (
            <button type="button" className="activity-create" onClick={addOwnActivity}>
              <Icon name="plus" size={20} />
              <span>Add “{activityName}” as your own activity</span>
            </button>
          )}
          {error && <p className="activity-create-error" role="alert">{error}</p>}
        </div>
      )}
    </section>
  )
}
