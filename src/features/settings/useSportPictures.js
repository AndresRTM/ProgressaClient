import { useCallback, useEffect, useRef, useState } from 'react'
import { useSports } from '../activities/useSports'
import {
  isSportId,
  readSportPictures,
  SPORT_PICTURES_KEY,
  validateSportPicture,
  writeSportPictures,
} from './sportPictures'

export default function useSportPictures() {
  const { sports } = useSports()
  const [state, setState] = useState(() => readSportPictures(sports))
  const currentPictures = useRef(state.pictures)

  useEffect(() => {
    function syncPictures(event) {
      if (event.key !== SPORT_PICTURES_KEY && event.key !== null) return
      const next = readSportPictures(sports)
      currentPictures.current = next.pictures
      setState(next)
    }

    window.addEventListener('storage', syncPictures)
    return () => window.removeEventListener('storage', syncPictures)
  }, [sports])

  const savePictures = useCallback(
    (pictures) => {
      const result = writeSportPictures(pictures, sports)
      if (!result.ok) {
        setState((current) => ({ ...current, error: result.error }))
        return false
      }

      currentPictures.current = pictures
      setState({ pictures, error: null })
      return true
    },
    [sports],
  )

  const setPicture = useCallback(
    (id, value) => {
      const picture = validateSportPicture(value)
      if (!isSportId(id, sports) || !picture) {
        setState((current) => ({
          ...current,
          error: 'This picture is not supported. Choose another picture.',
        }))
        return false
      }
      return savePictures({ ...currentPictures.current, [id]: picture })
    },
    [savePictures, sports],
  )

  const resetPicture = useCallback(
    (id) => {
      if (!isSportId(id, sports)) return false
      const pictures = { ...currentPictures.current }
      delete pictures[id]
      return savePictures(pictures)
    },
    [savePictures, sports],
  )

  const clearError = useCallback(() => {
    setState((current) => ({ ...current, error: null }))
  }, [])

  return {
    pictures: state.pictures,
    error: state.error,
    setPicture,
    resetPicture,
    clearError,
  }
}
