
import { useState } from 'react'
import HomePage from './features/home/HomePage'
import { SportsProvider } from './features/activities/SportsProvider'
import { AuthProvider } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import { useAuth } from './features/auth/useAuth'
import './App.css'

function AppContent() {
  const { isAuthenticated } = useAuth()

  const [authPage, setAuthPage] = useState('login')

  // Användaren är inte inloggad
  if (!isAuthenticated) {

    // Registreringssidan
    if (authPage === 'register') {
      return (
        <RegisterPage
          onGoToLogin={() => setAuthPage('login')}
        />
      )
    }

    // Inloggningssidan
    return (
      <LoginPage
        onGoToRegister={() => setAuthPage('register')}
      />
    )
  }

  // Användaren är inloggad
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
