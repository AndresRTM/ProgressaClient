
import { useState } from 'react'
import {
  resetPassword,
  passwordRecoveryErrorMessage,
} from '../../services/passwordRecoveryApi'
import './login.css'

export default function ResetPasswordPage({
  onGoToLogin,
  onGoToForgotPassword,
}) {
  const [resetDetails] = useState(() => {
    const params = new URLSearchParams(
      window.location.search
    )

    return {
      email: params.get('email')?.trim() ?? '',
      token: params.get('token') ?? '',
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasValidLink = Boolean(
    resetDetails.email && resetDetails.token
  )

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading || !hasValidLink) return

    const form = new FormData(event.currentTarget)

    const newPassword = String(
      form.get('newPassword') ?? ''
    )

    const confirmPassword = String(
      form.get('confirmPassword') ?? ''
    )

    setError('')

    const passwordIsValid =
      newPassword.length >= 8 &&
      newPassword.length <= 100 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^a-zA-Z0-9]/.test(newPassword)

    if (!passwordIsValid) {
      setError(
        'Password must contain 8–100 characters, ' +
        'an uppercase letter, a lowercase letter, ' +
        'a number and a special character.'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPassword({
        email: resetDetails.email,
        token: resetDetails.token,
        newPassword,
        confirmPassword,
      })

      setSuccess(true)

      // Remove the token from the address bar.
      window.history.replaceState(
        null,
        '',
        '/reset-password'
      )
    } catch (err) {
      setError(passwordRecoveryErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <header className="brand-row">
        <span className="brand">Progressa</span>
      </header>

      <main className="login-main">
        <h1>Reset your password</h1>

        <p className="login-lead">
          Choose a new password for your Progressa account.
        </p>

        {!hasValidLink ? (
          <div className="login-card">
            <p className="login-error" role="alert">
              This reset link is missing information.
              Please request a new one.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onGoToForgotPassword}
            >
              Request a new link
            </button>
          </div>
        ) : success ? (
          <div className="login-card">
            <p className="login-notice" role="status">
              Your password has been reset successfully.
              You can now sign in with your new password.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onGoToLogin}
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <form
            className="home-form login-card"
            onSubmit={handleSubmit}
          >
            <label>
              Email
              <input
                type="email"
                value={resetDetails.email}
                autoComplete="email"
                readOnly
              />
            </label>

            <label>
              New password
              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={loading}
              />
            </label>

            <label>
              Confirm new password
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={loading}
              />
            </label>

            <p className="login-lead">
              Use at least 8 characters including uppercase,
              lowercase, number and special character.
            </p>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? 'Resetting password…'
                : 'Reset password'}
            </button>

            <div className="login-register">
              <button
                type="button"
                className="login-register-button"
                onClick={onGoToLogin}
                disabled={loading}
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
