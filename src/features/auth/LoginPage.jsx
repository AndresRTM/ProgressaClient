import { useLayoutEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import { loginErrorMessage } from '../../services/authService'
import { useAuth } from './useAuth'
import './login.css'

export default function LoginPage() {
  const { login, signedOutReason } = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const headingRef = useRef(null)
  const passwordRef = useRef(null)

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    const form = new FormData(event.currentTarget)
    setError('')
    setSubmitting(true)

    try {
      await login({ email: form.get('email'), password: form.get('password') })
      // AuthProvider byter till appen när inloggningen lyckas.
    } catch (loginError) {
      setError(loginErrorMessage(loginError))
      setSubmitting(false)
      passwordRef.current?.select()
    }
  }

  return (
    <div className="login-page">
      <header className="brand-row">
        <span className="brand">Progressa</span>
      </header>

      <main className="login-main">
        <h1 ref={headingRef} tabIndex={-1}>
          Welcome back.
        </h1>
        <p className="login-lead">Sign in to pick up where your week left off.</p>

        {signedOutReason === 'expired' && !error && (
          <p className="login-notice" role="status">
            Your session has ended. Sign in again to continue.
          </p>
        )}
        {signedOutReason === 'deleted' && !error && (
          <p className="login-notice" role="status">
            Your account and all its data have been deleted.
          </p>
        )}

        <form className="home-form login-card" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck="false"
              maxLength="256"
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </label>

          <label>
            Password
            <span className="login-password">
              <input
                ref={passwordRef}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                maxLength="100"
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-error' : undefined}
              />
              <button
                type="button"
                className="login-reveal"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {error && (
            <p className="login-error" id="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
            <Icon name="arrow-right" size={19} />
          </button>
        </form>
      </main>
    </div>
  )
}
