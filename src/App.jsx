
import { useState, useEffect } from 'react' // NYTT: useEffect
import HomePage from './features/home/HomePage'
import { SportsProvider } from './features/activities/SportsProvider'
import { AuthProvider } from './features/auth/AuthProvider'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import { useAuth } from './features/auth/useAuth'
import './App.css'

// NYTT 1 – Importera sidor för lösenordsåterställning
// ÄNDRAT – använd den inre auth-mappen
import ForgotPasswordPage from './features/auth/auth/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/auth/ResetPasswordPage'
// NYTT 2 – Kontrollera om användaren öppnat en återställningslänk
function isResetPasswordUrl() {
  return (
    window.location.pathname.replace(/\/$/, '') ===
    '/reset-password'
  )
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth() // NYTT: logout

  // ÄNDRAT 3 – Kontrollera återställningslänken vid start
  const [authPage, setAuthPage] = useState(() =>
    isResetPasswordUrl() ? 'reset' : 'login'
  )

  // NYTT 4 – Hantera webbläsarens navigering
  useEffect(() => {
    function handlePopState() {
      setAuthPage(
        isResetPasswordUrl() ? 'reset' : 'login'
      )
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // NYTT 5 – Ta bort återställningstoken från webbadressen
  function clearResetUrl() {
    if (isResetPasswordUrl()) {
      window.history.replaceState(null, '', '/')
    }
  }

  // NYTT 6 – Navigera tillbaka till inloggningen
  function goToLogin() {
    clearResetUrl()

    if (isAuthenticated) {
      logout()
    }

    setAuthPage('login')
  }

  // NYTT 7 – Navigera till Forgot password
  function goToForgotPassword() {
    clearResetUrl()

    if (isAuthenticated) {
      logout()
    }

    setAuthPage('forgot')
  }

  // NYTT 8 – Hantera lyckad lösenordsåterställning
  function handlePasswordReset() {
    clearResetUrl()

    if (isAuthenticated) {
      logout()
    }
  }

  // NYTT 9 – Visa återställningssidan från mejllänken
  if (authPage === 'reset') {
    return (
      <ResetPasswordPage
        onGoToLogin={goToLogin}
        onGoToForgotPassword={goToForgotPassword}
        onPasswordReset={handlePasswordReset}
      />
    )
  }

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

    // NYTT 10 – Visa formuläret för glömt lösenord
    if (authPage === 'forgot') {
      return (
        <ForgotPasswordPage
          onGoToLogin={goToLogin}
        />
      )
    }

    // Inloggningssidan
    return (
      <LoginPage
        onGoToRegister={() => setAuthPage('register')}

        // NYTT 11 – Koppla Forgot password-knappen
        onGoToForgotPassword={goToForgotPassword}
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
