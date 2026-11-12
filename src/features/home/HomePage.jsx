import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import SettingsPage from '../settings/SettingsPage'
import useSettings from '../settings/useSettings'
import useSportPictures from '../settings/useSportPictures'
import AddActivityDialog from '../logging/AddActivityDialog'
import LogTodayDialog from '../logging/LogTodayDialog'
import DailyLogSummary from '../logging/DailyLogSummary'
import { useSports } from '../activities/useSports'
import PlanPage from '../plan/PlanPage'
import { ActivitySummary, BottomNav, GoalsCard, HomeHeader, WeekCard } from './HomeCards'
import {
  ActivityDetailDialog,
  ActivityDialog,
  AddGoalDialog,
  EditGoalDialog,
  GoalsDialog,
  ProfileDialog,
} from './HomeDialogs'
import { calculateSummary, dateAtOffset, DEMO_TODAY, startOfWeek, weeksBetween } from './homeData'
import useHomeData from './useHomeData'
import useRoute from './useRoute'
import { createGoalInApi, getGoals, updateGoalInApi } from './goalsApi'

// shortcut: "Repeat every week" adds separate copies for the coming weeks. Store a real
// weekly rule instead if repeated sessions need to be edited or stopped together.
const REPEAT_WEEKS = 12

export default function HomePage() {
  const {
    activities,
    profileName,
    dailyLogs,
    dataError,
    addActivity,
    logWorkout,
    setActivityDone,
    updateActivity,
    deleteActivity,
    restoreActivity,
    saveDailyLog,
    updateProfile,
  } = useHomeData()
  const { activityTypes } = useSports()
  const preferences = useSettings()
  const pictureStorage = useSportPictures()
  const { page, navigate: navigatePage, goBack } = useRoute()
  const isSettings = page.startsWith('settings')
  const previousPage = useRef(page)
  const homeScroll = useRef(0)
  const { timeFormat, weekStart: weekStartsOn } = preferences.settings.units
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY)
  const [dialog, setDialog] = useState(null)
  const [apiGoals, setApiGoals] = useState(null)
  const [goalsError, setGoalsError] = useState('')
  useEffect(() => {
    const controller = new AbortController();

    getGoals(controller.signal)
      .then(setApiGoals)
      .catch(() => {
        if (!controller.signal.aborted) {
          setGoalsError("Could not load your goals.");
        }
      });

    return () => controller.abort();
  }, []);
  const [notice, setNotice] = useState('')
  const [deletedActivity, setDeletedActivity] = useState(null)
  const dialogType = dialog?.type
  const weekStart = startOfWeek(selectedDate, weekStartsOn)
  const thisWeekStart = startOfWeek(DEMO_TODAY, weekStartsOn)
  const weekNavigation = {
    weekOffset: weeksBetween(thisWeekStart, weekStart),
    // Other weeks open on their first day; coming back to this week opens on today.
    onChangeWeek: (delta) => {
      const nextWeek = dateAtOffset(weekStart, delta * 7)
      setSelectedDate(nextWeek === thisWeekStart ? DEMO_TODAY : nextWeek)
    },
    onThisWeek: () => setSelectedDate(DEMO_TODAY),
  }
  const summary = calculateSummary(activities, weekStart, activityTypes)
  const detailActivity = ['detail', 'edit-activity'].includes(dialog?.type)
    ? activities.find((activity) => activity.id === dialog.activity.id)
    : null

  const closeDialog = () => setDialog(null)
  const openActivityForm = (date = selectedDate, activityType) => {
    setSelectedDate(date)
    setDialog({ type: 'add-activity', date, activityType })
  }

  function openSettings() {
    homeScroll.current = window.scrollY
    closeDialog()
    navigatePage('settings')
  }

  function openLogPreferences(nextPage, draft) {
    setDialog((current) => ({ ...current, initialValues: draft }))
    navigatePage(nextPage)
  }

  useLayoutEffect(() => {
    if (!isSettings && previousPage.current.startsWith('settings')) {
      window.scrollTo(0, homeScroll.current)
      if (dialog?.type !== 'log-today')
        document.querySelector('[data-settings-trigger]')?.focus({ preventScroll: true })
    }
    else if (page !== previousPage.current) {
      window.scrollTo(0, 0)
    }
    previousPage.current = page
  }, [page, isSettings, dialog?.type])

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (!deletedActivity || dialogType) return
    const timeout = setTimeout(() => setDeletedActivity(null), 20000)
    return () => clearTimeout(timeout)
  }, [deletedActivity, dialogType])

  function undoDelete() {
    if (!deletedActivity) return null
    const restored = restoreActivity(deletedActivity)
    if (restored) {
      setSelectedDate(restored.date)
      setDeletedActivity(null)
      setNotice('Activity restored.')
    } else {
      setNotice('This activity could not be restored. Please try again.')
    }
    return restored
  }

  const showUndo = Boolean(deletedActivity && !dialog)

  function navigate(tab) {
    closeDialog()
    if (tab === 'goals' || tab === 'activity') {
      setDialog({ type: tab })
    } else if (tab !== page) {
      navigatePage(tab)
    } else {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
    }
  }

  return (
    <div className={`app-shell${isSettings ? " app-shell--settings" : ""}`}>
      <a
        className="skip-link"
        href={isSettings ? "#settings-content" : "#main-content"}
        onClick={(event) => {
          event.preventDefault();
          const content = document.getElementById(
            isSettings ? "settings-content" : "main-content",
          );
          content?.focus();
          content?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      {isSettings ? (
        <SettingsPage
          page={page}
          navigate={navigatePage}
          onBack={goBack}
          profileName={profileName}
          preferences={preferences}
          pictureStorage={pictureStorage}
          onProfile={() => setDialog({ type: "profile" })}
          onGoals={() => setDialog({ type: "goals" })}
        />
      ) : (
        <>
          {page === "plan" ? (
            <>
              <HomeHeader
                profileName={profileName}
                onProfile={openSettings}
                title="Shape a week that fits you."
                subtitle="Pick a day. Plan the move."
              />
              <PlanPage
                {...{ weekStart, selectedDate, activities, timeFormat }}
                {...weekNavigation}
                sportPictures={pictureStorage.pictures}
                onSelect={setSelectedDate}
                onActivity={(activity) =>
                  setDialog({ type: "detail", activity })
                }
                onAdd={openActivityForm}
              />
            </>
          ) : (
            <>
              <HomeHeader profileName={profileName} onProfile={openSettings} />
              <main className="home-content" id="main-content" tabIndex={-1}>
                <WeekCard
                  {...{ weekStart, selectedDate, activities, timeFormat }}
                  {...weekNavigation}
                  sportPictures={pictureStorage.pictures}
                  onSelect={setSelectedDate}
                  onActivity={(activity) =>
                    setDialog({ type: "detail", activity })
                  }
                  onAdd={() => openActivityForm()}
                />
                <GoalsCard
                  goals={apiGoals}
                  goalsError={goalsError}
                  onAdd={() => setDialog({ type: "add-goal" })}
                />
                <DailyLogSummary
                  log={dailyLogs[selectedDate]}
                  units={preferences.settings.units}
                />
                <ActivitySummary summary={summary} />
              </main>
            </>
          )}
          <BottomNav
            activeTab={
              ["goals", "activity"].includes(dialog?.type) ? dialog.type : page
            }
            onNavigate={navigate}
            onAdd={() => setDialog({ type: "log-today", date: selectedDate })}
          />
        </>
      )}
      <div
        className={`notice${notice || showUndo ? " is-visible" : ""}${showUndo ? " notice-with-action" : ""}`}
        role="status"
      >
        {showUndo ? (
          <>
            <span>Activity deleted.</span>
            <button type="button" onClick={undoDelete}>
              Undo
            </button>
          </>
        ) : (
          notice
        )}
      </div>
      {dataError && (
        <p className="home-storage-error" role="alert">
          {dataError}
        </p>
      )}
      {dialog?.type === "log-today" && !isSettings && (
        <LogTodayDialog
          date={dialog.date}
          initialValues={dialog.initialValues}
          activities={activities}
          settings={preferences.settings}
          sportPictures={pictureStorage.pictures}
          dailyLog={dailyLogs[dialog.date]}
          dataError={dataError}
          onFavoriteChange={preferences.setFavoriteSports}
          onEditFavorites={(draft) =>
            openLogPreferences("settings/sports", draft)
          }
          onLoggingSettings={(draft) =>
            openLogPreferences("settings/logging", draft)
          }
          onLogWorkout={(activity, plannedId) => {
            const logged = logWorkout(activity, plannedId);
            if (logged) setNotice("Workout logged. Your week is updated.");
            return logged;
          }}
          onSaveDailyLog={(date, patch) => {
            const saved = saveDailyLog(date, patch);
            if (saved) setNotice("Your daily log is saved.");
            return saved;
          }}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "add-activity" && (
        <AddActivityDialog
          key="add-activity"
          selectedDate={dialog.date}
          activityType={dialog.activityType}
          weekStartsOn={weekStartsOn}
          favoriteSports={preferences.settings.favoriteSports}
          sportPictures={pictureStorage.pictures}
          onFavoriteChange={preferences.setFavoriteSports}
          onClose={closeDialog}
          onSave={(activity, repeatWeekly) => {
            const added = addActivity(activity);
            if (!added) return null;
            if (repeatWeekly) {
              for (let week = 1; week < REPEAT_WEEKS; week += 1) {
                addActivity({
                  ...activity,
                  date: dateAtOffset(activity.date, week * 7),
                });
              }
            }
            const weekday = new Date(
              `${added.date}T12:00:00`,
            ).toLocaleDateString("en-GB", {
              weekday: "long",
            });
            setSelectedDate(added.date);
            closeDialog();
            setNotice(
              `${activityTypes[added.type].label} added to ${weekday}.`,
            );
            return added;
          }}
        />
      )}
      {dialog?.type === "add-goal" && (
        <AddGoalDialog
          key="add-goal"
          onClose={closeDialog}
          onSave={async (goal) => {
            const created = await createGoalInApi(goal);
            setApiGoals((current) => [...(current ?? []), created]);
            setDialog({ type: "goals" });
          }}
        />
      )}
      {dialog?.type === "edit-activity" && detailActivity && (
        <AddActivityDialog
          key={`edit-${detailActivity.id}`}
          activity={detailActivity}
          selectedDate={detailActivity.date}
          weekStartsOn={weekStartsOn}
          favoriteSports={preferences.settings.favoriteSports}
          sportPictures={pictureStorage.pictures}
          onFavoriteChange={preferences.setFavoriteSports}
          onClose={() => setDialog({ ...dialog, type: "detail" })}
          onSave={(values) => {
            const updated = updateActivity(detailActivity.id, values);
            if (!updated) return null;
            setSelectedDate(updated.date);
            setDialog({ ...dialog, type: "detail", activity: updated });
            setNotice("Activity updated.");
            return updated;
          }}
        />
      )}
      {dialog?.type === "detail" && detailActivity && (
        <ActivityDetailDialog
          key="detail"
          activity={detailActivity}
          timeFormat={timeFormat}
          sportPictures={pictureStorage.pictures}
          onEdit={(activity) =>
            setDialog({ ...dialog, type: "edit-activity", activity })
          }
          onDelete={(activity) => {
            const removed = deleteActivity(activity.id);
            if (!removed) return null;
            setDeletedActivity(removed);
            setNotice("");
            closeDialog();
            return removed;
          }}
          onSetDone={(activity, done) => {
            const updated = setActivityDone(activity.id, done);
            if (updated)
              setNotice(
                done
                  ? "Activity marked as done."
                  : "Activity marked as upcoming.",
              );
            return updated;
          }}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "goals" && (
        <GoalsDialog
          key="goals"
          goals={apiGoals}
          goalsError={goalsError}
          onRemoved={(id) => {
            setApiGoals((current) => current.filter((goal) => goal.id !== id));
          }}
          onAdd={() => setDialog({ type: "add-goal" })}
          onEdit={(goal) => setDialog({ type: "edit-goal", goal })}
          onClose={closeDialog}
        />
      )}

      {dialog?.type === "edit-goal" && (
        <EditGoalDialog
          goal={dialog.goal}
          onClose={() => setDialog({ type: "goals" })}
          onSave={async (id, changes) => {
            const { startDate, endDate, isCompleted, calendarId } = dialog.goal;

            try {
              const updated = await updateGoalInApi(id, {
                startDate,
                endDate,
                isCompleted,
                calendarId,
                ...changes,
              });

              setApiGoals((current) =>
                current.map((goal) => (goal.id === id ? updated : goal)),
              );
              setDialog({ type: "goals" });
            } catch {
              window.alert("Could not save your changes. Please try again..");
            }
          }}
        />
      )}

      {dialog?.type === "activity" && (
        <ActivityDialog
          key="activity"
          summary={summary}
          dailyLog={dailyLogs[selectedDate]}
          units={preferences.settings.units}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === "profile" && (
        <ProfileDialog
          key="profile"
          profileName={profileName}
          onClose={closeDialog}
          onSave={(name) => {
            updateProfile(name);
            closeDialog();
            setNotice("Profile updated.");
          }}
        />
      )}
    </div>
  );
}
