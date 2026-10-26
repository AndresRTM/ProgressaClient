import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import SportPicture from './SportPicture'
import { SPORTS } from './settingsData'
import { prepareSportImage } from './sportPictures'
import './sportPictures.css'

export default function SportPicturePicker({ sport, picture, storage, onClose }) {
  const [draft, setDraft] = useState(picture)
  const [processing, setProcessing] = useState(false)
  const [imageError, setImageError] = useState('')
  const fileRef = useRef(null)
  const uploadRequest = useRef(0)

  useEffect(
    () => () => {
      uploadRequest.current += 1
    },
    [],
  )

  async function choosePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const request = ++uploadRequest.current
    setImageError('')
    storage.clearError()
    setProcessing(true)
    try {
      const src = await prepareSportImage(file)
      if (request === uploadRequest.current) setDraft({ type: 'image', src })
    } catch (error) {
      if (request === uploadRequest.current) setImageError(error.message)
    } finally {
      if (request === uploadRequest.current) setProcessing(false)
    }
  }

  function selectIcon(icon) {
    setDraft({ type: 'icon', icon })
    setImageError('')
    storage.clearError()
  }

  function save() {
    const saved = draft ? storage.setPicture(sport.id, draft) : storage.resetPicture(sport.id)
    if (saved) onClose()
  }

  return (
    <Sheet title={`${sport.label} picture`} onClose={onClose}>
      <div className="picture-picker">
        <div className="picture-picker-preview">
          <SportPicture sport={sport} picture={draft} size={76} />
          <p>
            Choose an icon or use a photo.<small>Photos stay in this browser.</small>
          </p>
        </div>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          aria-label={`Upload a picture for ${sport.label}`}
          onChange={choosePhoto}
          tabIndex={-1}
        />
        <button
          className="picture-upload"
          onClick={() => fileRef.current?.click()}
          disabled={processing}
        >
          <Icon name="image" size={20} />
          {processing ? 'Preparing photo…' : 'Choose a photo'}
          <Icon name="plus" size={16} />
        </button>
        <div className="picture-picker-heading">
          <h3>Sport icons</h3>
          <button
            disabled={processing}
            onClick={() => {
              setDraft(undefined)
              setImageError('')
              storage.clearError()
            }}
          >
            Use default
          </button>
        </div>
        <div className="picture-icon-options" role="group" aria-label="Choose a sport icon">
          {SPORTS.map((option) => {
            const selected = draft?.type !== 'image' && (draft?.icon || sport.icon) === option.icon
            return (
              <button
                key={option.id}
                className="picture-icon-option"
                aria-label={`Use ${option.label} icon`}
                aria-pressed={selected}
                disabled={processing}
                onClick={() => selectIcon(option.icon)}
              >
                <SportPicture sport={option} size={40} />
                <span>{option.label}</span>
                {selected && (
                  <span className="picture-option-check">
                    <Icon name="check" size={11} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {(imageError || storage.error) && (
          <p className="picture-error" role="alert">
            {imageError || storage.error}
          </p>
        )}
        <button className="primary-button" disabled={processing} onClick={save}>
          Save picture
          <Icon name="check" size={18} />
        </button>
      </div>
    </Sheet>
  )
}
