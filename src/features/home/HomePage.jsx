import { useEffect, useState } from 'react'
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
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const weekStart = dateAtOffset(
    selectedDate,
    -((new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7),
  )
  const summary = calculateSummary(activities, weekStart)
  const closeDialog = () => setDialog(null)
  const openActivityForm = (date = selectedDate) => {
    setSelectedDate(date)
    setDialog({ type: 'add-activity', date })
  }
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
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <HomeHeader profileName={profileName} onProfile={() => setDialog({ type: 'profile' })} />
      <main className="home-content" id="main-content">
        <WeekCard
          {...{ weekStart, selectedDate, activities }}
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
      <div className={`notice${notice ? ' is-visible' : ''}`} role="status">
        {notice}
      </div>
      {dialog?.type === 'add-activity' && (
        <AddActivityDialog
          key="add-activity"
          selectedDate={dialog.date}
          onClose={closeDialog}
          onSave={(activity) => {
            addActivity(activity)
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
          {...{ weekStart, selectedDate, activities }}
          onSelect={setSelectedDate}
          onActivity={(activity) => setDialog({ type: 'detail', activity })}
          onAdd={openActivityForm}
          onClose={closeDialog}
        />
      )}
      {dialog?.type === 'detail' && (
        <ActivityDetailDialog key="detail" activity={dialog.activity} onClose={closeDialog} />
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
