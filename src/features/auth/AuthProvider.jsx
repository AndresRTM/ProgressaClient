import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from '../../services/api'
import {
  clearAppStorage,
  clearSession,
  getSession,
  reloadSession,
  SESSION_STORAGE_KEY,
  sessionExpiresIn,
  setSession,
} from '../../services/authSession'
import {
  deleteAccount as deleteAccountRequest,
  login as loginRequest,
} from '../../services/authService'
import { AuthContext } from './useAuth'

// setTimeout klarar högst ~24,8 dygn.
const MAX_TIMEOUT = 2_147_483_647

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(getSession)
  // Varför användaren loggades ut: null, 'expired' eller 'deleted'. Visas på inloggningssidan.
  const [signedOutReason, setSignedOutReason] = useState(null)

  const endSession = useCallback((reason) => {
    clearSession()
    setSessionState(null)
    setSignedOutReason(reason)
  }, [])

  const login = useCallback(async (credentials) => {
    const next = await loginRequest(credentials)
    setSession(next)
    setSessionState(next)
    setSignedOutReason(null)
    return next
  }, [])

  // Lokal utloggning: rensar token i webbläsaren. Anropet till POST /api/auth/logout
  // och utloggningsknappen hör till issue #11.
  const logout = useCallback(() => endSession(null), [endSession])

  // Raderar kontot i backenden och sedan all lokal data, så att inget finns kvar i webbläsaren.
  const deleteAccount = useCallback(
    async (password) => {
      try {
        await deleteAccountRequest(password)
      } catch (error) {
        // 404: kontot finns redan inte, så vi städar upp lokalt ändå.
        if (error?.response?.status !== 404) throw error
      }
      clearAppStorage()
      window.history.replaceState(null, '', window.location.pathname)
      endSession('deleted')
    },
    [endSession],
  )

  // Backenden svarade 401 på ett inloggat anrop: token är ogiltig eller har gått ut.
  useEffect(() => setUnauthorizedHandler(() => endSession('expired')), [endSession])

  // Logga ut när token går ut, även om inga anrop görs.
  useEffect(() => {
    if (!session) return undefined
    const remaining = sessionExpiresIn(session)
    if (remaining === null) return undefined
    const timer = window.setTimeout(
      () => endSession('expired'),
      Math.min(Math.max(remaining, 0), MAX_TIMEOUT),
    )
    return () => window.clearTimeout(timer)
  }, [session, endSession])

  // Håll flikar i synk: loggar man in eller ut i en flik gäller det alla.
  useEffect(() => {
    function syncSession(event) {
      if (event.key !== SESSION_STORAGE_KEY && event.key !== null) return
      setSessionState(reloadSession())
    }
    window.addEventListener('storage', syncSession)
    return () => window.removeEventListener('storage', syncSession)
  }, [])

  const value = useMemo(
    () => ({
      user: session ? { id: session.userId, email: session.email } : null,
      isAuthenticated: session !== null,
      signedOutReason,
      login,
      logout,
      deleteAccount,
    }),
    [session, signedOutReason, login, logout, deleteAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
