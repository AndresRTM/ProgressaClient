
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

  useEffect(() => {
    function handlePopState() {
      setAuthPage(
        isResetPasswordUrl() ? 'reset' : 'login'
      )
    }

    window.addEventListener(
      'popstate',
      handlePopState
    )

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      )
    }
  }, [])

  function goToLogin() {
    if (isResetPasswordUrl()) {
      window.history.replaceState(null, '', '/')
    }

    setAuthPage('login')
  }

  function goToForgotPassword() {
    if (isResetPasswordUrl()) {
      window.history.replaceState(null, '', '/')
    }

    setAuthPage('forgot')
  }

  function goToRegister() {
    setAuthPage('register')
  }

  // Password reset page opened from email
  if (authPage === 'reset') {
    return (
      <ResetPasswordPage
        onGoToLogin={goToLogin}
        onGoToForgotPassword={goToForgotPassword}
      />
    )
  }

  if (!isAuthenticated) {
    // Registration
    if (authPage === 'register') {
      return (
        <RegisterPage
          onGoToLogin={goToLogin}
        />
      )
    }

    // Request a password reset email
    if (authPage === 'forgot') {
      return (
        <ForgotPasswordPage
          onGoToLogin={goToLogin}
        />
      )
    }

    // Sign in
    return (
      <LoginPage
        onGoToRegister={goToRegister}
        onGoToForgotPassword={goToForgotPassword}
      />
    )
  }

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
