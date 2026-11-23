
import { useState } from 'react'

// ÄNDRAT 1 – Korrekt sökväg till API-filen
import {
  forgotPassword,
  passwordRecoveryErrorMessage,
} from '../../../services/passwordRecoveryApi'

// ÄNDRAT 2 – Korrekt sökväg till CSS-filen
import BrandMark from '../../../components/BrandMark'
import '../login.css'

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
      await forgotPassword(email)

      setSuccess(true)
    } catch (err) {
      setError(
        passwordRecoveryErrorMessage(err, 'forgot')
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
        <h1>Forgot your password?</h1>

        <p className="login-lead">
          Enter your email address to request
          a password reset link.
        </p>

        {success ? (
          <div className="home-form login-card">
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
