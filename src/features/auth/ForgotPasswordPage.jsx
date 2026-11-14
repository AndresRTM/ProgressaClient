
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

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasValidLink = Boolean(
    resetDetails.email && resetDetails.token
  )

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading || !hasValidLink) return

    setError('')

    const passwordIsValid =
      password.length >= 8 &&
      password.length <= 100 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)

    if (!passwordIsValid) {
      setError(
        'Password must contain 8–100 characters, ' +
        'an uppercase letter, a lowercase letter, ' +
        'a number and a special character.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await resetPassword({
        email: resetDetails.email,
        token: resetDetails.token,
        newPassword: password,
        confirmPassword,
      })

      setPassword('')
      setConfirmPassword('')
      setSuccess(true)

      // Remove the reset token from the URL
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
          Enter your new password to access your account.
        </p>

        {!hasValidLink ? (
          <div className="login-card">
            <p className="login-error" role="alert">
              This password reset link is invalid
              or missing information.
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
              You can now sign in.
            </p>

            <button
              type="button"
              className="primary-button"
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
            {/* Email */}
            <label>
              Email
              <input
                type="email"
                value={resetDetails.email}
                readOnly
                autoComplete="email"
              />
            </label>

            {/* New password */}
            <label>
              New password
              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={loading}
              />
            </label>

            {/* Confirm password */}
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                disabled={loading}
              />
            </label>

            {/* Error message */}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {/* Reset password */}
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? 'Resetting password…'
                : 'Reset password'}
            </button>

            {/* Back to login */}
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
