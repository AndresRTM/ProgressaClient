
import { useState } from 'react'
import { register, registerErrorMessage } from '../../services/authService'
import './login.css'

export default function RegisterPage({ onGoToLogin }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const password = form.get('password')
    const confirmPassword = form.get('confirmPassword')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await register({
        firstName: form.get('firstName'),
        lastName: form.get('lastName'),
        email: form.get('email'),
        age: form.get('age'),
        password,
        confirmPassword,
      })

      setSuccess(true)
    } catch (err) {
      setError(registerErrorMessage(err))
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
        <h1>Create your account.</h1>
        <p className="login-lead">
          Start your journey with Progressa.
        </p>

        {success ? (
          <div className="login-card">
            <p role="status">
              Your account has been created successfully!
            </p>
            <button
              className="primary-button"
              type="button"
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
              First name
              <input
                name="firstName"
                maxLength={15}
                autoComplete="given-name"
                required
              />
            </label>

            <label>
              Last name
              <input
                name="lastName"
                maxLength={15}
                autoComplete="family-name"
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                maxLength={256}
                required
              />
            </label>

            <label>
              Age
              <input
                name="age"
                type="number"
                min={1}
                max={120}
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                minLength={8}
                maxLength={100}
                autoComplete="new-password"
                required
              />
            </label>

            <label>
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                minLength={8}
                maxLength={100}
                autoComplete="new-password"
                required
              />
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <button
              type="button"
              onClick={onGoToLogin}
            >
              Already have an account? Sign in
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
