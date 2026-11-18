import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import Sheet from '../../components/Sheet'
import { getPlannedSessionsForDay } from '../home/calendarApi'
import { useSports } from '../activities/useSports'
import { activityNameKey } from '../activities/activityCatalog'
import ActivityPicker from './ActivityPicker'
import DailyLogFields from './DailyLogFields'
import { KJ_PER_KCAL } from './dailyLogData'
import WorkoutDetails from './WorkoutDetails'
import './logToday.css'

function initialDraft(saved, initialValues) {
  return (
    initialValues || {
      amounts: {},
      checks: { ...saved?.checks },
      sleepMinutes: saved?.sleepMinutes ?? '',
    }
  )
}

export default function LogTodayDialog({
  date,
  activities = [],
  settings,
  sportPictures,
  dailyLog,
  initialValues,
  onLogWorkout,
  onSaveDailyLog,
  onFavoriteChange,
  onEditFavorites,
  onLoggingSettings,
  onClose,
  preview = false,
  dataError,
}) {
  const { sports } = useSports()
  const [selected, setSelected] = useState(null)
  const [plannedSessionId, setPlannedSessionId] = useState('')
  const [draft, setDraft] = useState(() => initialDraft(dailyLog, initialValues))
  const [searching, setSearching] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [plannedSessions, setPlannedSessions] = useState(null)
  const savingWorkout = useRef(false)
  const [plannedSessionsError, setPlannedSessionsError] = useState('')
  useEffect(() => {
    if (preview) return;

    const controller = new AbortController();
    setPlannedSessions(null);
    setPlannedSessionsError("");

    getPlannedSessionsForDay(date, controller.signal)
      .then((sessions) => {
        if (!controller.signal.aborted) setPlannedSessions(sessions);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPlannedSessionsError("Could not load planned workouts.");
        }
      });

    return () => controller.abort();
  }, [date, preview]);
  const [error, setError] = useState('')
  const sport = sports.find((item) => item.id === selected)
  const matchingPlannedSessions = sport && plannedSessions ? plannedSessions.filter(
    (session) => activityNameKey(session.categoryName) === activityNameKey(sport.label),
  )
  : []

    const selectedPlannedSession = matchingPlannedSessions.find(
      (session) =>
        matchingPlannedSessions.length === 1 ||
        String(session.id) === plannedSessionId,
    );

    let plannedActivity;

    if (selectedPlannedSession) {
      plannedActivity = {
        id: selectedPlannedSession.id,
        time: new Date(selectedPlannedSession.scheduledAt).toLocaleTimeString(
          "sv-SE",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        ),
        duration: selectedPlannedSession.plannedDurationInMinutes,
        intensity: null,
      };
    } else if (matchingPlannedSessions.length === 0) {
      plannedActivity = activities.find(
        (activity) =>
          activity.type === selected &&
          activity.date === date &&
          !activity.logged,
      );
    }
  const hasDailyFields = Object.values(settings.logging).some((mode) => mode !== 'off')
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  async function LogWorkout(workout) {
    if (savingWorkout.current) return false

    if (!preview && plannedSessions === null) {
      setError(plannedSessionsError || "Wait for planned workouts to load.");
      return false;
    }

    if (matchingPlannedSessions.length > 0 && !selectedPlannedSession) {
      setError("Choose which planned workout to log.");
      return false;
    }

    if (
      selectedPlannedSession &&
      new Date(selectedPlannedSession.scheduledAt).getTime() > Date.now()
    ) {
      setError("This planned workout has not started yet.");
      return false;
    }

    if (!preview) {
      savingWorkout.current = true;

      try {
        const logged = await onLogWorkout(workout, plannedActivity?.id);
        if (!logged) throw new Error("Workout could not be logged.");
        if (selectedPlannedSession) {
          setPlannedSessions((current) =>
            current.filter((session) => session.id !== selectedPlannedSession.id),
          )
        }
      } catch {
        setError(
          "This workout could not be logged. Check its details and try again.",
        );
        return false;
      } finally {
        savingWorkout.current = false;
      }
    }
    setError('')
    if (!hasDailyFields) onClose()
    else {
      setFeedback(
        `${preview ? 'Preview: ' : ''}${sport.label} · ${workout.duration} min${preview ? '' : ' logged'}`,
      )
      setSelected(null)
      setSearching(false)
    }
    return true
  }

  function saveDailyLog(event) {
    event.preventDefault()
    const patch = { amounts: {}, checks: {} }
    for (const [key, mode] of Object.entries(settings.logging)) {
      if (mode === 'goal') patch.checks[key] = Boolean(draft.checks[key])
      if (mode !== 'amount') continue
      const raw = key === 'sleep' ? draft.sleepMinutes : draft.amounts[key]
      if (raw === undefined || raw === '') continue
      let amount = Number(raw)
      if (!Number.isFinite(amount) || amount < 0) {
        setError('Enter a valid amount for each field.')
        return
      }
      if (key === 'sleep') patch.sleepMinutes = amount
      else {
        if (key === 'calories' && settings.units.energy === 'kj')
          amount = Math.round(amount / KJ_PER_KCAL)
        patch.amounts[key] = amount
      }
    }
    if (preview || onSaveDailyLog(date, patch)) onClose()
    else setError('This log could not be saved. Check the amounts and try again.')
  }

  return (
    <Sheet title="Log today" onClose={onClose} className="log-sheet" showHandle>
      <p className="log-date">{dateLabel}</p>
      {preview && (
        <p className="log-preview-note">
          Preview only. Entries here aren't saved.
        </p>
      )}
      {sport ? (
        <WorkoutDetails
          key={`${sport.id}-${plannedActivity?.id ?? "new"}`}
          sport={sport}
          picture={sportPictures?.[sport.id]}
          plannedActivity={plannedActivity}
          plannedTimePicker={
            matchingPlannedSessions.length > 1 && (
              <fieldset className="workout-option-group">
                <legend>Planned start time</legend>
                <div className="workout-duration-options workout-time-options">
                  {matchingPlannedSessions.map((session) => {
                    const id = String(session.id);
                    const isSelected = plannedSessionId === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setPlannedSessionId(id)}
                      >
                        {new Date(session.scheduledAt).toLocaleTimeString(
                          "sv-SE",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                        {isSelected && <span aria-hidden="true"> ✓</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )
          }
          date={date}
          onChangeSport={() => {
            setSelected(null);
            setSearching(false);
          }}
          onSave={LogWorkout}
        />
      ) : (
        <>
          <ActivityPicker
            favoriteSports={settings.favoriteSports}
            sportPictures={sportPictures}
            activities={activities}
            plannedSessions={plannedSessions ?? []}
            date={date}
            heading={hasDailyFields ? "Training" : "Favorites"}
            onSelect={(id) => {
              setSelected(id);
              setPlannedSessionId("");
              setError("");
            }}
            onSearchChange={setSearching}
            allowCreate={!preview}
            onFavoriteChange={onFavoriteChange}
            onEditFavorites={
              onEditFavorites ? () => onEditFavorites(draft) : undefined
            }
          />
          {feedback && (
            <p className="log-workout-feedback" role="status">
              <Icon name="check" size={15} />
              {feedback}
            </p>
          )}
          {!searching &&
            (hasDailyFields ? (
              <form className="log-daily-form" onSubmit={saveDailyLog}>
                <DailyLogFields
                  modes={settings.logging}
                  targets={settings.targets}
                  units={settings.units}
                  value={draft}
                  onChange={setDraft}
                  onSettings={
                    onLoggingSettings
                      ? () => onLoggingSettings(draft)
                      : undefined
                  }
                />
                <button className="primary-button log-save" type="submit">
                  Save log
                </button>
              </form>
            ) : (
              <p className="log-picker-help">
                Tap what you trained today. Choose your duration and intensity
                next.
              </p>
            ))}
        </>
      )}
      {(error || plannedSessionsError || dataError) && (
        <p className="log-error" role="alert">
          {error || plannedSessionsError || dataError}
        </p>
      )}
    </Sheet>
  );
}
