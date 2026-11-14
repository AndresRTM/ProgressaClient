
import { useState } from 'react'
import {
  forgotPassword,
  passwordRecoveryErrorMessage,
} from '../../services/passwordRecoveryApi'

import './login.css'

export default function ForgotPasswordPage({
  onGoToLogin,
}) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting) return

    setError('')
    setSubmitting(true)

    try {
      await forgotPassword(email.trim())

      setSuccess(true)
    } catch (err) {
      setError(
        passwordRecoveryErrorMessage(err)
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <header className="brand-row">
        <span className="brand">Progressa</span>
      </header>

      <main className="login-main">
        <h1>Forgot your password?</h1>

        <p className="login-lead">
          Enter your email address to request
          a password reset link.
        </p>

        {success ? (
          <div className="login-card">
            <p
              className="login-notice"
              role="status"
            >
              If an account exists with this email
              address, you will receive password
              reset instructions.
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
            <label>
              Email

              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={256}
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
                ? 'Sending instructions…'
                : 'Send reset instructions'}
            </button>

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
