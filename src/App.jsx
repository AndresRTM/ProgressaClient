
import { useEffect, useState } from 'react'

import HomePage from './features/home/HomePage'

import { SportsProvider } from './features/activities/SportsProvider'
import { AuthProvider } from './features/auth/AuthProvider'

import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ForgotPasswordPage from './features/auth/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/ResetPasswordPage'

import { useAuth } from './features/auth/useAuth'

import './App.css'

// Check whether the URL is a password reset link
function isResetPasswordUrl() {
  return (
    window.location.pathname.replace(/\/$/, '') ===
    '/reset-password'
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  const [authPage, setAuthPage] = useState(() =>
    isResetPasswordUrl() ? 'reset' : 'login'
  )

  // Handle browser back/forward navigation
  useEffect(() => {
    function handlePopState() {
      setAuthPage(
        isResetPasswordUrl() ? 'reset' : 'login'
      )
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      )
    }
  }, [])

  // Navigate back to login
  function goToLogin() {
    if (isResetPasswordUrl()) {
      window.history.replaceState(null, '', '/')
    }

    setAuthPage('login')
  }

  // Navigate to forgot password
  function goToForgotPassword() {
    if (isResetPasswordUrl()) {
      window.history.replaceState(null, '', '/')
    }

    setAuthPage('forgot')
  }

  // Navigate to registration
  function goToRegister() {
    setAuthPage('register')
  }

  // Reset password page
  // Allow users to open reset links from email
  // even if they are not signed in.
  if (authPage === 'reset') {
    return (
      <ResetPasswordPage
        onGoToLogin={goToLogin}
        onGoToForgotPassword={goToForgotPassword}
      />
    )
  }

  // User is not authenticated
  if (!isAuthenticated) {
    // Registration page
    if (authPage === 'register') {
      return (
        <RegisterPage
          onGoToLogin={goToLogin}
        />
      )
    }

    // Forgot password page
    if (authPage === 'forgot') {
      return (
        <ForgotPasswordPage
          onGoToLogin={goToLogin}
        />
      )
    }

    // Login page
    return (
      <LoginPage
        onGoToRegister={goToRegister}
        onGoToForgotPassword={goToForgotPassword}
      />
    )
  }

  // Authenticated user
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
