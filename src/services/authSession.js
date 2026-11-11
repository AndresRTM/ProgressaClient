// Den inloggade sessionen (JWT + användaruppgifter).
// Hålls i minnet och sparas i localStorage så att man förblir inloggad mellan besök.
export const SESSION_STORAGE_KEY = 'progressa:auth:v1'

let currentSession = readStoredSession()

// Läser utgångstiden (exp) ur JWT:n. Signaturen kontrolleras av backenden, inte här.
function tokenExpiresAt(token) {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const { exp } = JSON.parse(atob(padded))
    return Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}

function isValidSession(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.token === 'string' &&
    value.token.length > 0 &&
    typeof value.userId === 'string' &&
    typeof value.email === 'string'
  )
}

function isExpired(session) {
  const expiresAt = tokenExpiresAt(session.token)
  return expiresAt !== null && expiresAt <= Date.now()
}

function readStoredSession() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY))
    if (!isValidSession(stored) || isExpired(stored)) return null
    return { token: stored.token, userId: stored.userId, email: stored.email }
  } catch {
    return null
  }
}

export function getSession() {
  return currentSession
}

// Millisekunder till token går ut, eller null om det inte går att läsa.
export function sessionExpiresIn(session) {
  const expiresAt = tokenExpiresAt(session.token)
  return expiresAt === null ? null : expiresAt - Date.now()
}

export function setSession(session) {
  currentSession = session
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Inloggningen fungerar ändå under det här besöket om lagringen är avstängd.
  }
}

export function clearSession() {
  currentSession = null
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Inget att rensa om lagringen inte går att nå.
  }
}

// Läser om sessionen från lagringen, t.ex. när en annan flik loggat in eller ut.
export function reloadSession() {
  currentSession = readStoredSession()
  return currentSession
}
