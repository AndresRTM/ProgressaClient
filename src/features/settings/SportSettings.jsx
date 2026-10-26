import { useState } from 'react'
import { SPORTS } from './settingsData'
import FavoriteSportsSettings from './FavoriteSportsSettings'
import SportPicturePicker from './SportPicturePicker'

export default function SportSettings({ value, onChange, pictureStorage }) {
  const [editingSport, setEditingSport] = useState(null)
  const sport = SPORTS.find((item) => item.id === editingSport)
  return (
    <>
      <FavoriteSportsSettings
        value={value}
        onChange={onChange}
        pictures={pictureStorage.pictures}
        onEditPicture={(id) => {
          pictureStorage.clearError()
          setEditingSport(id)
        }}
      />
      {sport && (
        <SportPicturePicker
          key={sport.id}
          sport={sport}
          picture={pictureStorage.pictures[sport.id]}
          storage={pictureStorage}
          onClose={() => setEditingSport(null)}
        />
      )}
      {!sport && pictureStorage.error && (
        <p role="alert" className="picture-error">
          {pictureStorage.error}
        </p>
      )}
    </>
  )
}
