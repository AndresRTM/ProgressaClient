import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../../components/Icon";
import Sheet from "../../components/Sheet";
import SportPicture from "../settings/SportPicture";
import DailyLogSummary from "../logging/DailyLogSummary";
import { useSports } from "../activities/useSports";
import { formatTime } from "../settings/formatTime";
import { ActivityChart } from "./HomeCards";
import { formatDuration } from "./homeData";
import "./calendarActivity.css";
import "./goalsDialog.css";
import {
  createGoalActivity,
  deleteGoalFromApi,
  getGoalActivities,
} from "./goalsApi";
import AddGoalActivityDialog from "./AddGoalActivityDialog";

export function AddGoalDialog({goal, onSave, onClose }) {
  const [metric, setMetric] = useState(String(goal?.metric ?? ""));
  const [activities, setActivities] = useState([]);
  const [activityError, setActivityError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [activityId, setActivityId] = useState(
    goal?.categoryId != null
      ? String(goal.categoryId)
      : goal?.metric === 2
        ? "all"
        : "",
  );

  const isSessions = metric === "1";
  const isDuration = metric === "2";
  const isVariety = metric === "3";

  useEffect(() => {
    const controller = new AbortController();

    getGoalActivities(controller.signal)
      .then(setActivities)
      .catch(() => {
        if (!controller.signal.aborted) {
          setActivityError("Could not load activities.");
        }
      });

    return () => controller.abort();
  }, []);

  async function saveActivity(name) {
    const created = await createGoalActivity(name);

    setActivities((current) => [
      ...current.filter((activity) => activity.id !== created.id),
      created,
    ]);
    setActivityId(String(created.id));
    setActivityError("");
    setShowActivityDialog(false);
  }

  async function submit(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const startDate = data.get("startDate");
    const endDate = data.get("endDate");
    const activity = activityId;

    const target = isDuration
      ? Number(data.get("hours")) * 60 + Number(data.get("minutes"))
      : Number(data.get("target"));

    if (endDate < startDate) {
      setError(
        "End date must be on or after the start date.",
      );
      return;
    }

    if (!Number.isInteger(target) || target < 1 || target > 2147483647) {
      setError(
        isDuration
          ? "Enter a duration of at least one minute."
          : "Enter a target greater than zero.",
      );
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onSave({
        title: data.get("title").trim(),
        metric: metric ? Number(metric) : null,
        categoryId: activity && activity !== "all" ? Number(activity) : null,
        target,
        startDate: `${startDate}T00:00:00`,
        endDate: `${endDate}T23:59:59`,
      });
    } catch {
      setError("Could not save the goal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Sheet title={goal ? "Edit goal" : "Add goal"} onClose={onClose}>
        <form className="home-form" onSubmit={submit}>
          <label>
            Goal name
            <input name="title" defaultValue={goal?.title ?? ""} maxLength={60} pattern=".*\S.*" required />
          </label>

          <label>
            What do you want to track?
            <select
              value={metric}
              onChange={(event) => {
                setMetric(event.target.value);
                setActivityId("");
              }}
              required={!goal}
            >
              <option value="" disabled>
                Select a metric
              </option>
              <option value="1">Number of sessions</option>
              <option value="2">Duration</option>
              <option value="3">Different activities</option>
            </select>
          </label>

          {(isSessions || isDuration) && (
            <>
              <label>
                Activity
                <select
                  name="categoryId"
                  value={activityId}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value === "add-activity") {
                      setShowActivityDialog(true);
                    } else {
                      setActivityId(value);
                    }
                  }}
                  required
                >
                  <option value="" disabled>
                    Select an activity
                  </option>
                  {isDuration && <option value="all">All activities</option>}
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                  <option value="add-activity">+ Add activity type</option>
                </select>
              </label>
              {activityError && <p role="alert">{activityError}</p>}
            </>
          )}

          {isDuration && (
            <div className="form-columns">
              <label>
                Hours
                <input
                  name="hours"
                  defaultValue={goal?.metric === 2 ? Math.floor(goal.target / 60) : ""}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                />
              </label>
              <label>
                Minutes
                <input
                  name="minutes"
                  defaultValue={goal?.metric === 2 ? goal.target % 60 : ""}
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  placeholder="0"
                />
              </label>
            </div>
          )}

          {(isSessions || isVariety || (goal && !metric)) && (
            <label>
              {isSessions
                ? "Target sessions"
                : isVariety
                  ? "Target activity types"
                  : "Target"}
              <input
                name="target"
                type="number"
                min={1}
                max={2147483647}
                defaultValue={goal?.metric === 2 ? "" : (goal?.target ?? "")}
                required
              />
            </label>
          )}

          <label>
            Start date
            <input
              name="startDate"
              type="date"
              defaultValue={goal?.startDate?.slice(0, 10)}
              required
            />
          </label>

          <label>
            End date
            <input
              name="endDate"
              type="date"
              defaultValue={goal?.endDate?.slice(0, 10)}
              required
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : goal ? "Save changes" : "Add goal"}
          </button>
        </form>
      </Sheet>
      {showActivityDialog && (
        <AddGoalActivityDialog
          onSave={saveActivity}
          onClose={() => setShowActivityDialog(false)}
        />
      )}
    </>
  );
}

export function EditGoalDialog({ goal, onSave, onClose }) {
  return (
    <AddGoalDialog
      key={goal.id}
      goal={goal}
      onSave={(changes) => onSave(goal.id, changes)}
      onClose={onClose}
    />
  );
}

export function ActivityDetailDialog({
  activity,
  onClose,
  onSetDone,
  onEdit,
  onDelete,
  timeFormat,
  sportPictures,
}) {
  const { activityTypes } = useSports();
  const [feedback, setFeedback] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const cancelDeleteRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const wasConfirmingDelete = useRef(false);
  const type = activityTypes[activity.type] ?? {
    label: activity.categoryName,
    icon: "activity",
    color: "var(--muted)",
  };
  const done = activity.logged === true;

  useLayoutEffect(() => {
    if (confirmDelete) cancelDeleteRef.current?.focus();
    else if (wasConfirmingDelete.current)
      deleteButtonRef.current?.focus({ preventScroll: true });
    wasConfirmingDelete.current = confirmDelete;
  }, [confirmDelete]);

  function changeStatus() {
    const updated = onSetDone(activity, !done);
    setFeedback(
      updated
        ? done
          ? "Marked as upcoming. You can mark it done when you finish."
          : "Activity marked as done. Nice work!"
        : "Could not update this activity. Please try again.",
    );
  }

  function deleteActivity() {
    const deleted = onDelete(activity);
    if (!deleted)
      setDeleteError("Could not delete this activity. Please try again.");
  }

  return (
    <Sheet title={type.label} onClose={onClose}>
      <div className="activity-detail-icon" style={{ color: type.color }}>
        {sportPictures?.[activity.type] ? (
          <SportPicture
            sport={type}
            picture={sportPictures[activity.type]}
            size={90}
          />
        ) : (
          <Icon name={type.icon} size={58} />
        )}
      </div>
      <p className="detail-date">
        {new Date(`${activity.date}T12:00:00`).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
      <p className={`detail-status ${done ? "detail-status-done" : ""}`}>
        <Icon name={done ? "check" : "calendar"} size={15} />
        {done ? "Done" : "Upcoming"}
      </p>
      <dl className="detail-list">
        <div>
          <dt>Start time</dt>
          <dd>{formatTime(activity.time, timeFormat)}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{activity.duration} minutes</dd>
        </div>
        {activity.pace && (
          <div>
            <dt>Your rhythm</dt>
            <dd>{activity.pace}</dd>
          </div>
        )}
      </dl>
      {confirmDelete ? (
        <section
          className="calendar-delete-confirm"
          aria-labelledby="calendar-delete-title"
        >
          <h3 id="calendar-delete-title">Delete this activity?</h3>
          <p>
            This removes this {type.label} session from your calendar. Your
            activity and favorites stay saved.
          </p>
          <div className="calendar-delete-actions">
            <button
              ref={cancelDeleteRef}
              className="calendar-edit-button"
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                setDeleteError("");
              }}
            >
              Cancel
            </button>
            <button
              className="calendar-delete-button"
              type="button"
              onClick={deleteActivity}
            >
              Delete activity
            </button>
          </div>
          <p className="calendar-delete-error" role="alert">
            {deleteError}
          </p>
        </section>
      ) : (
        <div className="calendar-detail-actions">
          <button
            className={done ? "detail-status-button" : "primary-button"}
            type="button"
            disabled={typeof activity.id === "number"}
            onClick={changeStatus}
          >
            {done ? "Mark as upcoming" : "Mark as done"}
            <Icon name={done ? "rotate-ccw" : "check"} size={19} />
          </button>
          <div className="calendar-edit-actions">
            <button
              className="calendar-edit-button"
              type="button"
              disabled={typeof activity.id === "number"}
              onClick={() => onEdit(activity)}
            >
              <Icon name="edit" size={18} />
              Edit activity
            </button>
            <button
              ref={deleteButtonRef}
              className="calendar-delete-button"
              type="button"
              disabled={typeof activity.id === "number"}
              onClick={() => {
                setFeedback("");
                setConfirmDelete(true);
              }}
            >
              <Icon name="minus-circle" size={18} />
              Delete activity
            </button>
          </div>
        </div>
      )}
      <p className="detail-status-feedback" role="status">
        {feedback}
      </p>
    </Sheet>
  );
}

export function GoalsDialog({
  goals,
  goalsError,
  onAdd,
  onEdit,
  onRemoved,
  onClose,
}) {
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);

  async function removeGoal(goal) {
    if (!window.confirm(`Remove "${goal.title}"?`)) return;

    setError("");
    setDeleting(true);

    try {
      await deleteGoalFromApi(goal.id);
      onRemoved(goal.id);
    } catch {
      setError("Could not remove the goal. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet
      title="Small goals. Real progress."
      onClose={onClose}
      className="goals-dialog"
    >
      <div
        className="goals-dialog-list"
        role="region"
        aria-label="Goals"
        tabIndex={0}
      >
        {error && <p role="alert">{error}</p>}
        {goalsError && <p role="alert">{goalsError}</p>}
        {!goalsError && goals === null && <p>Loading goals…</p>}
        {goals?.length === 0 && <p>No goals yet.</p>}

        {goals?.map((goal) => {
          const hasProgress = Number.isFinite(goal.progress) && goal.target > 0;
          const isDuration = goal.metric === 2;
          const percent = hasProgress
            ? Math.min(100, (goal.progress / goal.target) * 100)
            : 0;

          const current = isDuration
            ? formatDuration(goal.progress)
            : goal.progress;
          const target = isDuration ? formatDuration(goal.target) : goal.target;

          return (
            <div
              className="goal-dialog-card"
              data-metric={goal.metric}
              key={goal.id}
            >
              {hasProgress ? (
                <div
                  className="goal-dialog-ring"
                  style={{ "--goal-progress": `${percent}%` }}
                  role="progressbar"
                  aria-label={goal.title}
                  aria-valuemin={0}
                  aria-valuemax={goal.target}
                  aria-valuenow={Math.min(goal.progress, goal.target)}
                  aria-valuetext={`${current} of ${target}`}
                >
                  <span>
                    {current}/{isDuration && <br />}
                    {target}
                  </span>
                </div>
              ) : (
                <div className="goal-dialog-ring goal-dialog-ring--legacy">
                  <span>
                    Target
                    <br />
                    {target}
                  </span>
                </div>
              )}

              <div className="goal-dialog-card-content">
                <h3>{goal.title}</h3>
                <div className="goal-dialog-actions">
                  <button type="button" onClick={() => onEdit(goal)}>
                    <Icon name="edit" size={17} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal)}
                    disabled={deleting}
                  >
                    <Icon name="trash" size={17} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="primary-button" type="button" onClick={onAdd}>
        Add goal
      </button>
    </Sheet>
  );
}

export function ActivityDialog({ summary, dailyLog, units, onClose }) {
  return (
    <Sheet title="A week in motion" onClose={onClose}>
      <div className="expanded-summary">
        <ActivityChart summary={summary} />
        <p>
          <strong>{formatDuration(summary.totalMinutes)}</strong> of movement
          this week
        </p>
      </div>
      <DailyLogSummary log={dailyLog} units={units} embedded />
      <dl className="detail-list">
        {summary.byType.map((type) => (
          <div key={type.type}>
            <dt>
              <span className="legend-dot" style={{ background: type.color }} />
              {type.label}
              <small>
                {type.sessions} {type.sessions === 1 ? "session" : "sessions"}
              </small>
            </dt>
            <dd>{formatDuration(type.minutes)}</dd>
          </div>
        ))}
      </dl>
    </Sheet>
  );
}

export function ProfileDialog({ profileName, onSave, onClose }) {
  return (
    <Sheet title="Your space." onClose={onClose}>
      <p className="sheet-description">Make it feel a little more like you.</p>
      <form
        className="home-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(new FormData(event.currentTarget).get("name").trim());
        }}
      >
        <label>
          Display name
          <input
            name="name"
            defaultValue={profileName}
            maxLength="40"
            pattern=".*\S.*"
            required
            autoComplete="nickname"
          />
        </label>
        <button className="primary-button" type="submit">
          Save profile
          <Icon name="check" size={19} />
        </button>
      </form>
    </Sheet>
  );
}
