import HomePage from './features/home/HomePage'
import { SportsProvider } from './features/activities/SportsProvider'
import { AuthProvider } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import { useAuth } from './features/auth/useAuth'
import './App.css'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return <LoginPage />

  return (
    <SportsProvider>
      <HomePage />
    </SportsProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
