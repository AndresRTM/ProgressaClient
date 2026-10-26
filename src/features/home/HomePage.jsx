import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import SettingsPage from '../settings/SettingsPage'
import useSettings from '../settings/useSettings'
import useSettingsRoute from '../settings/useSettingsRoute'
import useSportPictures from '../settings/useSportPictures'
import { ActivitySummary, BottomNav, GoalsCard, HomeHeader, WeekCard } from './HomeCards'
import {
  ActivityDetailDialog,
  ActivityDialog,
  AddActivityDialog,
  AddGoalDialog,
  GoalsDialog,
  PlanDialog,
  ProfileDialog,
} from './HomeDialogs'
import { calculateSummary, dateAtOffset, DEMO_TODAY } from './homeData'
import useHomeData from './useHomeData'

export default function HomePage() {
  const { activities, goals, profileName, addActivity, addGoal, updateProfile } = useHomeData()
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
  const weekStart = dateAtOffset(
    selectedDate,
    -(weekStartsOn === 'sun'
      ? new Date(`${selectedDate}T12:00:00`).getDay()
      : (new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7),
  )
  const summary = calculateSummary(activities, weekStart)
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
  useLayoutEffect(() => {
    if (page === 'home' && previousPage.current !== 'home') {
      window.scrollTo(0, homeScroll.current)
      document.querySelector('[data-settings-trigger]')?.focus({ preventScroll: true })
    }
    previousPage.current = page
  }, [page])
  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(timeout)
  }, [notice])
  function navigate(tab) {
    if (tab === 'home') {
      closeDialog()
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
    } else setDialog({ type: tab })
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
            <ActivitySummary summary={summary} />
          </main>
          <BottomNav
            activeTab={['plan', 'goals', 'activity'].includes(dialog?.type) ? dialog.type : 'home'}
            onNavigate={navigate}
            onAdd={() => openActivityForm()}
          />
        </>
      )}
      <div className={`notice${notice ? ' is-visible' : ''}`} role="status">
        {notice}
      </div>
      {dialog?.type === 'add-activity' && (
        <AddActivityDialog
          key="add-activity"
          selectedDate={dialog.date}
          activityType={dialog.activityType}
          onClose={closeDialog}
          onSave={(activity) => {
            const added = addActivity(activity)
            if (!added) return
            setSelectedDate(added.date)
            closeDialog()
            setNotice('Activity added to your week.')
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
      {dialog?.type === 'plan' && (
        <PlanDialog
          key="plan"
          {...{ weekStart, selectedDate, activities, timeFormat, weekStartsOn }}
          favoriteSports={preferences.settings.favoriteSports}
          sportPictures={pictureStorage.pictures}
          onSelect={setSelectedDate}
          onActivity={(activity) => setDialog({ type: 'detail', activity })}
          onAdd={openActivityForm}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'detail' && (
        <ActivityDetailDialog
          key="detail"
          activity={dialog.activity}
          timeFormat={timeFormat}
          sportPictures={pictureStorage.pictures}
          onClose={closeDialog}
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
        <ActivityDialog key="activity" summary={summary} onClose={closeDialog} />
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
