import { useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import { MAX_ACTIVITY_NAME_LENGTH } from '../activities/activityCatalog'

export default function CreateActivityDialog({ initialName = '', canFavorite, onCreate, onClose }) {
  const [name, setName] = useState(initialName)
  const [favorite, setFavorite] = useState(canFavorite)
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const result = onCreate(name, canFavorite && favorite)
    if (result?.error) setError(result.error)
  }

  return (
    <Sheet title="Add your own activity" onClose={onClose} showHandle>
      <p className="sheet-description">
        Give it a name. You can choose it when you log a workout or plan your week.
      </p>
      <form className="home-form create-activity-form" onSubmit={submit}>
        <label>
          Activity name
          <input
            name="activityName"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
            placeholder="e.g. Dancing"
            maxLength={MAX_ACTIVITY_NAME_LENGTH}
            pattern=".*\S.*"
            autoComplete="off"
            aria-describedby="custom-activity-name-hint"
            required
          />
        </label>
        <p id="custom-activity-name-hint" className="custom-activity-name-hint">
          Up to {MAX_ACTIVITY_NAME_LENGTH} characters. If it already exists, we’ll use that activity.
        </p>
        {canFavorite ? (
          <label className="custom-activity-favorite">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(event) => setFavorite(event.target.checked)}
            />
            <span>Add to my favorites</span>
            <Icon name="star" size={18} />
          </label>
        ) : (
          <p className="custom-activity-full">
            Your six favorites are full. You can still add this activity, then remove a favorite to make room.
          </p>
        )}
        {error && <p className="custom-activity-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit">
          Add activity
          <Icon name="plus" size={19} />
        </button>
      </form>
    </Sheet>
  )
}
