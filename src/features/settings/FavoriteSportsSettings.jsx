import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../../components/Icon'
import { SPORTS } from './settingsData'
import SportPicture from './SportPicture'
import './favorites.css'

const sortTransition = { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
const dropAnimation = {
  ...sortTransition,
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' } } }),
}
const screenReaderInstructions = {
  draggable:
    'Press Space or Enter to pick up a sport. Use the up and down arrow keys to move it. Press Space or Enter to drop it, or Escape to cancel.',
}

function verticalOnly({ transform }) {
  return { ...transform, x: 0 }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function SportCopy({ sport }) {
  return (
    <span className="sport-copy">
      <span>{sport.label}</span>
      <small>{sport.description}</small>
    </span>
  )
}

function FavoriteSport({
  sport,
  picture,
  position,
  total,
  reducedMotion,
  onRemove,
  onEditPicture,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sport.id,
    disabled: total < 2,
    transition: reducedMotion ? null : sortTransition,
  })

  return (
    <li
      ref={setNodeRef}
      className={`favorite-sport-row${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        ref={setActivatorNodeRef}
        className="sport-drag"
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${sport.label}, position ${position} of ${total}`}
        disabled={total < 2}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Icon name="grip" size={18} />
      </button>
      <SportPicture sport={sport} picture={picture} editable onClick={onEditPicture} />
      <SportCopy sport={sport} />
      <button
        className="sport-action"
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${sport.label} from favorites`}
      >
        <Icon name="minus-circle" size={22} />
      </button>
    </li>
  )
}

function DraggedSport({ sport, picture }) {
  return (
    <div className="favorite-sport-overlay" aria-hidden="true">
      <span className="sport-drag">
        <Icon name="grip" size={18} />
      </span>
      <SportPicture sport={sport} picture={picture} />
      <SportCopy sport={sport} />
      <span className="sport-action">
        <Icon name="minus-circle" size={22} />
      </span>
    </div>
  )
}

export default function FavoriteSportsSettings({ value, onChange, pictures = {}, onEditPicture }) {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const dragOrder = useRef(value)
  const reducedMotion = useReducedMotion()
  const favorites = value.map((id) => SPORTS.find((sport) => sport.id === id)).filter(Boolean)
  const activeSport = favorites.find((sport) => sport.id === activeId)
  const available = SPORTS.filter(
    (sport) =>
      !value.includes(sport.id) && sport.label.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function sportLabel(id) {
    return SPORTS.find((sport) => sport.id === id)?.label ?? 'Sport'
  }

  function endDrag({ active, over }) {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = value.indexOf(active.id)
    const newIndex = value.indexOf(over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(value, oldIndex, newIndex))
  }

  function removeSport(sport) {
    onChange(value.filter((id) => id !== sport.id))
    setAnnouncement(`${sport.label} removed from favorites.`)
  }

  function addSport(sport) {
    if (value.length >= 6 || value.includes(sport.id)) return
    onChange([...value, sport.id])
    setAnnouncement(`${sport.label} added to favorites, position ${value.length + 1}.`)
  }

  const dragAnnouncements = {
    onDragStart({ active }) {
      return `${sportLabel(active.id)} picked up, position ${value.indexOf(active.id) + 1} of ${value.length}.`
    },
    onDragOver({ active, over }) {
      if (!over) return `${sportLabel(active.id)} is outside the favorites list.`
      return `${sportLabel(active.id)} at position ${value.indexOf(over.id) + 1} of ${value.length}.`
    },
    onDragEnd({ active, over }) {
      if (!over) return `Reordering cancelled. ${sportLabel(active.id)} was not moved.`
      return `${sportLabel(active.id)} dropped at position ${dragOrder.current.indexOf(over.id) + 1} of ${value.length}.`
    },
    onDragCancel({ active }) {
      return `Reordering cancelled. ${sportLabel(active.id)} was not moved.`
    },
  }

  return (
    <div className="settings-sections favorite-settings">
      <section className="settings-card" aria-label="Your favorite sports">
        <div className="favorites-heading">
          <h2 className="settings-section-label">Your favorites</h2>
          <span>{value.length} / 6</span>
        </div>
        <p className="settings-hint">
          Hold the handle and drag to reorder. Your first three show on Plan.
        </p>
        <p className="settings-hint sport-picture-hint">Tap a picture to change it.</p>
        {favorites.length === 0 && (
          <p className="favorites-empty">Add your favorite sports below.</p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[verticalOnly]}
          autoScroll={{ acceleration: 8, threshold: { x: 0.1, y: 0.15 } }}
          accessibility={{
            announcements: dragAnnouncements,
            screenReaderInstructions,
            restoreFocus: true,
          }}
          onDragStart={({ active }) => {
            dragOrder.current = [...value]
            setActiveId(active.id)
          }}
          onDragEnd={endDrag}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={value} strategy={verticalListSortingStrategy}>
            <ol className="sports-list favorite-sports-list" aria-label="Favorite sports in order">
              {favorites.map((sport, index) => (
                <FavoriteSport
                  key={sport.id}
                  sport={sport}
                  picture={pictures[sport.id]}
                  position={index + 1}
                  total={favorites.length}
                  reducedMotion={reducedMotion}
                  onRemove={() => removeSport(sport)}
                  onEditPicture={() => onEditPicture?.(sport.id)}
                />
              ))}
            </ol>
          </SortableContext>
          {createPortal(
            <DragOverlay
              adjustScale={false}
              dropAnimation={reducedMotion ? null : dropAnimation}
              transition={reducedMotion ? 'none' : undefined}
              zIndex={1000}
            >
              {activeSport && (
                <DraggedSport sport={activeSport} picture={pictures[activeSport.id]} />
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </section>
      <section className="settings-card" aria-label="All sports">
        <h2 className="settings-section-label">All sports</h2>
        <p className="settings-hint">
          {value.length >= 6
            ? 'Favorites are full. Remove one to add another.'
            : 'Choose up to six of your favorite sports.'}
        </p>
        <label className="sports-search">
          <Icon name="search" size={17} />
          <input
            aria-label="Search all sports"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all sports"
          />
        </label>
        <ul className="sports-list available-sports-list">
          {available.map((sport) => (
            <li key={sport.id}>
              <SportPicture
                sport={sport}
                picture={pictures[sport.id]}
                editable
                onClick={() => onEditPicture?.(sport.id)}
              />
              <SportCopy sport={sport} />
              <button
                className="sport-action"
                type="button"
                disabled={value.length >= 6}
                onClick={() => addSport(sport)}
                aria-label={`Add ${sport.label} to favorites`}
              >
                <Icon name="plus-circle" size={22} />
              </button>
            </li>
          ))}
        </ul>
        {available.length === 0 && <p className="favorites-empty">No sports match your search.</p>}
      </section>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  )
}
