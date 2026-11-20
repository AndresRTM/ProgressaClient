
import { useState } from 'react'

// ÄNDRAT 1 – Korrekt sökväg till API-filen
import {
  resetPassword,
  passwordRecoveryErrorMessage,
} from '../../../services/passwordRecoveryApi'

// ÄNDRAT 2 – Korrekt sökväg till CSS-filen
import BrandMark from '../../../components/BrandMark'
import '../login.css'

export default function ResetPasswordPage({
  onGoToLogin,
  onGoToForgotPassword,
  onPasswordReset,
}) {
  const [{ email, token }] = useState(() => {
    const params = new URLSearchParams(
      window.location.search
    )

    return {
      email: params.get('email') ?? '',
      token: params.get('token') ?? '',
    }
  })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasLink = Boolean(
    email.trim() && token.trim()
  )

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting || !hasLink) return

    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      await resetPassword({
        email,
        token,
        newPassword: password,
        confirmPassword,
      })

      setPassword('')
      setConfirmPassword('')
      setSuccess(true)

      onPasswordReset()
    } catch (err) {
      setError(
        passwordRecoveryErrorMessage(err, 'reset')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <header className="brand-row">
        <span className="brand">
          <BrandMark size={32} />
          Progressa
        </span>
      </header>

      <main className="login-main">
        <h1>Reset your password.</h1>

        <p className="login-lead">
          Choose a new password for your
          Progressa account.
        </p>

        {success ? (
          <div className="home-form login-card">
            <p
              className="login-notice"
              role="status"
            >
              Your password has been updated.
              Sign in with your new password.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onGoToLogin}
            >
              Back to sign in
            </button>
          </div>
        ) : !hasLink ? (
          <div className="home-form login-card">
            <p
              className="login-error"
              role="alert"
            >
              The reset link is incomplete or invalid.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onGoToForgotPassword}
            >
              Request a new link
            </button>

            <button
              type="button"
              className="login-register-button"
              onClick={onGoToLogin}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form
            className="home-form login-card"
            onSubmit={handleSubmit}
          >
            <p className="login-lead">
              Use 8–100 characters, including
              uppercase and lowercase letters,
              a number and a special character.
            </p>

            <label>
              New password

              <input
                name="newPassword"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={submitting}
              />
            </label>

            <label>
              Confirm password

              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={submitting}
              />
            </label>

            {error && (
              <p
                className="login-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting
                ? 'Updating password…'
                : 'Reset password'}
            </button>

            <div className="login-register">
              <button
                type="button"
                className="login-register-button"
                onClick={onGoToForgotPassword}
                disabled={submitting}
              >
                Request a new link
              </button>
            </div>

            <div className="login-register">
              <button
                type="button"
                className="login-register-button"
                onClick={onGoToLogin}
                disabled={submitting}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
