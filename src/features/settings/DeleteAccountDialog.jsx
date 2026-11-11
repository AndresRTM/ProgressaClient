import { useEffect, useRef, useState } from 'react'
import Sheet from '../../components/Sheet'
import Icon from '../../components/Icon'
import { deleteAccountErrorMessage } from '../../services/authService'
import { useAuth } from '../auth/useAuth'
import './deleteAccount.css'

export default function DeleteAccountDialog({ onClose }) {
  const { user, deleteAccount } = useAuth()
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const passwordRef = useRef(null)

  // Körs efter att Sheet öppnat dialogen, annars flyttar webbläsaren fokus till stängknappen.
  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  const close = () => {
    if (!deleting) onClose()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (deleting) return

    const password = new FormData(event.currentTarget).get('password')
    setError('')
    setDeleting(true)

    try {
      // Lyckas det loggas användaren ut och dialogen försvinner med resten av appen.
      await deleteAccount(password)
    } catch (deleteError) {
      setError(deleteAccountErrorMessage(deleteError))
      setDeleting(false)
      passwordRef.current?.select()
    }
  }

  return (
    <Sheet title="Delete your account?" onClose={close}>
      <p className="sheet-description">
        This permanently deletes <strong>{user?.email}</strong> and everything in it: activities,
        goals, logs and settings. It can’t be undone.
      </p>
      <form className="home-form" onSubmit={handleSubmit}>
        <label>
          Enter your password to confirm
          <input
            ref={passwordRef}
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength="100"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'delete-account-error' : undefined}
          />
        </label>

        {error && (
          <p className="delete-account-error" id="delete-account-error" role="alert">
            {error}
          </p>
        )}

        <div className="delete-account-actions">
          <button
            type="button"
            className="delete-account-cancel"
            onClick={close}
            disabled={deleting}
          >
            Cancel
          </button>
          <button type="submit" className="delete-account-confirm" disabled={deleting}>
            <Icon name="trash" size={18} />
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </form>
    </Sheet>
  )
}
