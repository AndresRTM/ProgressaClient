import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import SettingsPage from '../settings/SettingsPage'
import useSettings from '../settings/useSettings'
import useSettingsRoute from '../settings/useSettingsRoute'
import useSportPictures from '../settings/useSportPictures'
import AddActivityDialog from '../logging/AddActivityDialog'
import LogTodayDialog from '../logging/LogTodayDialog'
import DailyLogSummary from '../logging/DailyLogSummary'
import { useSports } from '../activities/useSports'
import { ActivitySummary, BottomNav, GoalsCard, HomeHeader, WeekCard } from './HomeCards'
import {
  ActivityDetailDialog,
  ActivityDialog,
  AddGoalDialog,
  GoalsDialog,
  PlanDialog,
  ProfileDialog,
} from './HomeDialogs'
import { calculateSummary, DEMO_TODAY, startOfWeek } from './homeData'
import useHomeData from './useHomeData'

export default function HomePage() {
  const {
    activities,
    goals,
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
    addGoal,
    updateProfile,
  } = useHomeData()
  const { activityTypes } = useSports()
  const preferences = useSettings()
  const pictureStorage = useSportPictures()
  const { page, navigate: navigatePage, goBack } = useSettingsRoute()
  const isSettings = page !== 'home'
  const previousPage = useRef(page)
  const homeScroll = useRef(0)
  const { timeFormat, weekStart: weekStartsOn } = preferences.settings.units
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const [deletedActivity, setDeletedActivity] = useState(null)
  const dialogType = dialog?.type
  const weekStart = startOfWeek(selectedDate, weekStartsOn)
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
    if (page === 'home' && previousPage.current !== 'home') {
      window.scrollTo(0, homeScroll.current)
      if (dialog?.type !== 'log-today')
        document.querySelector('[data-settings-trigger]')?.focus({ preventScroll: true })
    }
    previousPage.current = page
  }, [page, dialog?.type])

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (!deletedActivity || (dialogType && dialogType !== 'plan')) return
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
    if (tab === 'home') {
      closeDialog()
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
    } else {
      setDialog({ type: tab })
    }
  }

  return (
    <div className={`app-shell${isSettings ? ' app-shell--settings' : ''}`}>
      <a
        className="skip-link"
        href={isSettings ? '#settings-content' : '#main-content'}
        onClick={(event) => {
          event.preventDefault()
          const content = document.getElementById(isSettings ? 'settings-content' : 'main-content')
          content?.focus()
          content?.scrollIntoView()
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
          onProfile={() => setDialog({ type: 'profile' })}
          onGoals={() => setDialog({ type: 'goals' })}
        />
      ) : (
        <>
          <HomeHeader profileName={profileName} onProfile={openSettings} />
          <main className="home-content" id="main-content" tabIndex={-1}>
            <WeekCard
              {...{ weekStart, selectedDate, activities, timeFormat }}
              sportPictures={pictureStorage.pictures}
              onSelect={setSelectedDate}
              onPlan={() => setDialog({ type: 'plan' })}
              onActivity={(activity) => setDialog({ type: 'detail', activity })}
              onAdd={() => openActivityForm()}
            />
            <GoalsCard {...{ goals, summary }} onAdd={() => setDialog({ type: 'add-goal' })} />
            <DailyLogSummary log={dailyLogs[selectedDate]} units={preferences.settings.units} />
            <ActivitySummary summary={summary} />
          </main>
          <BottomNav
            activeTab={['plan', 'goals', 'activity'].includes(dialog?.type) ? dialog.type : 'home'}
            onNavigate={navigate}
            onAdd={() => setDialog({ type: 'log-today', date: selectedDate })}
          />
        </>
      )}
      <div className={`notice${notice || showUndo ? ' is-visible' : ''}${showUndo ? ' notice-with-action' : ''}`} role="status">
        {showUndo ? (
          <>
            <span>Activity deleted.</span>
            <button type="button" onClick={undoDelete}>Undo</button>
          </>
        ) : notice}
      </div>
      {dataError && (
        <p className="home-storage-error" role="alert">
          {dataError}
        </p>
      )}
      {dialog?.type === 'log-today' && page === 'home' && (
        <LogTodayDialog
          date={dialog.date}
          initialValues={dialog.initialValues}
          activities={activities}
          settings={preferences.settings}
          sportPictures={pictureStorage.pictures}
          dailyLog={dailyLogs[dialog.date]}
          dataError={dataError}
          onFavoriteChange={preferences.setFavoriteSports}
          onEditFavorites={(draft) => openLogPreferences('settings/sports', draft)}
          onLoggingSettings={(draft) => openLogPreferences('settings/logging', draft)}
          onLogWorkout={(activity, plannedId) => {
            const logged = logWorkout(activity, plannedId)
            if (logged) setNotice('Workout logged. Your week is updated.')
            return logged
          }}
          onSaveDailyLog={(date, patch) => {
            const saved = saveDailyLog(date, patch)
            if (saved) setNotice('Your daily log is saved.')
            return saved
          }}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'add-activity' && (
        <AddActivityDialog
          key="add-activity"
          selectedDate={dialog.date}
          activityType={dialog.activityType}
          favoriteSports={preferences.settings.favoriteSports}
          sportPictures={pictureStorage.pictures}
          onFavoriteChange={preferences.setFavoriteSports}
          onClose={closeDialog}
          onSave={(activity) => {
            const added = addActivity(activity)
            if (!added) return null
            setSelectedDate(activity.date)
            closeDialog()
            setNotice('Activity added to your week.')
            return added
          }}
        />
      )}
      {dialog?.type === 'add-goal' && (
        <AddGoalDialog
          key="add-goal"
          onClose={closeDialog}
          onSave={(goal) => {
            addGoal(goal)
            closeDialog()
            setNotice('Your new goal is ready.')
          }}
        />
      )}
      {dialog?.type === 'edit-activity' && detailActivity && (
        <AddActivityDialog
          key={`edit-${detailActivity.id}`}
          activity={detailActivity}
          selectedDate={detailActivity.date}
          favoriteSports={preferences.settings.favoriteSports}
          sportPictures={pictureStorage.pictures}
          onFavoriteChange={preferences.setFavoriteSports}
          onClose={() => setDialog({ ...dialog, type: 'detail' })}
          onSave={(values) => {
            const updated = updateActivity(detailActivity.id, values)
            if (!updated) return null
            setSelectedDate(updated.date)
            setDialog({ ...dialog, type: 'detail', activity: updated })
            setNotice('Activity updated.')
            return updated
          }}
        />
      )}
      {dialog?.type === 'plan' && (
        <PlanDialog
          key="plan"
          {...{ weekStart, selectedDate, activities, timeFormat }}
          favoriteSports={preferences.settings.favoriteSports}
          sportPictures={pictureStorage.pictures}
          deletedActivity={deletedActivity}
          onUndoDelete={undoDelete}
          onSelect={setSelectedDate}
          onActivity={(activity) => {
            setSelectedDate(activity.date)
            setDialog({ type: 'detail', activity, returnTo: 'plan' })
          }}
          onAdd={openActivityForm}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'detail' && detailActivity && (
        <ActivityDetailDialog
          key="detail"
          activity={detailActivity}
          timeFormat={timeFormat}
          sportPictures={pictureStorage.pictures}
          onEdit={(activity) => setDialog({ ...dialog, type: 'edit-activity', activity })}
          onDelete={(activity) => {
            const removed = deleteActivity(activity.id)
            if (!removed) return null
            setDeletedActivity(removed)
            setNotice('')
            if (dialog.returnTo === 'plan') setDialog({ type: 'plan' })
            else closeDialog()
            return removed
          }}
          onSetDone={(activity, done) => {
            const updated = setActivityDone(activity.id, done)
            if (updated) setNotice(done ? 'Activity marked as done.' : 'Activity marked as upcoming.')
            return updated
          }}
          onClose={() => dialog.returnTo === 'plan' ? setDialog({ type: 'plan' }) : closeDialog()}
        />
      )}
      {dialog?.type === 'goals' && (
        <GoalsDialog
          key="goals"
          {...{ goals, summary }}
          onAdd={() => setDialog({ type: 'add-goal' })}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'activity' && (
        <ActivityDialog
          key="activity"
          summary={summary}
          dailyLog={dailyLogs[selectedDate]}
          units={preferences.settings.units}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'profile' && (
        <ProfileDialog
          key="profile"
          profileName={profileName}
          onClose={closeDialog}
          onSave={(name) => {
            updateProfile(name)
            closeDialog()
            setNotice('Profile updated.')
          }}
        />
      )}
    </div>
  )
}
