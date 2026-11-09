import { useState } from 'react'
import Sheet from '../../components/Sheet'
import { useSports } from '../activities/useSports'
import ActivityPicker from './ActivityPicker'
import WorkoutDetails from './WorkoutDetails'
import './logToday.css'

export default function AddActivityDialog({
  selectedDate,
  favoriteSports,
  sportPictures,
  activityType,
  activity,
  onFavoriteChange,
  onSave,
  onClose,
}) {
  const { sports } = useSports()
  const [selected, setSelected] = useState(activity?.type || activityType || null)
  const [draft, setDraft] = useState(activity || null)
  const [error, setError] = useState('')
  const editing = Boolean(activity)
  const sport = sports.find((item) => item.id === selected)
  return (
    <Sheet title={editing ? 'Edit activity' : 'Plan activity'} onClose={onClose} className="log-sheet" showHandle>
      <p className="log-date">{editing ? 'Make it work for your week.' : 'Choose an activity, then set its time.'}</p>
      {sport ? (
        <WorkoutDetails
          key={sport.id}
          sport={sport}
          picture={sportPictures?.[sport.id]}
          date={draft?.date || selectedDate}
          plannedActivity={draft}
          kind={editing ? 'edit' : 'plan'}
          onChangeSport={(values) => {
            setDraft(values)
            setSelected(null)
            setError('')
          }}
          onSave={(activity) => {
            const saved = onSave(activity)
            if (!saved) setError('This activity could not be saved. Check its details and try again.')
            return saved
          }}
        />
      ) : (
        <ActivityPicker
          favoriteSports={favoriteSports}
          sportPictures={sportPictures}
          date={selectedDate}
          onFavoriteChange={onFavoriteChange}
          onSelect={setSelected}
        />
      )}
      {error && <p className="log-error" role="alert">{error}</p>}
    </Sheet>
  )
}
