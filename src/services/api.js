import axios from 'axios'
import { getSession } from './authSession'

const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  console.warn('VITE_API_BASE_URL saknas. Lägg till den i .env.development.')
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Skicka med token på alla anrop när någon är inloggad.
api.interceptors.request.use((config) => {
  const session = getSession()
  if (session) config.headers.set('Authorization', `Bearer ${session.token}`)
  return config
})

let unauthorizedHandler = null

// AuthProvider registrerar vad som ska hända när backenden svarar 401 på ett inloggat anrop.
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {

    const sentAuthorization = error.config?.headers?.get?.('Authorization')
    const session = getSession()
    if (
      error.response?.status === 401 &&
      session &&
      sentAuthorization === `Bearer ${session.token}`
    ) {
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

export function isNetworkError(error) {
  return axios.isAxiosError(error) && !error.response
}

export function firstValidationError(error) {
  const errors = error?.response?.data?.errors
  if (!errors || typeof errors !== 'object') return null
  const messages = Object.values(errors).flat()
  return messages.find((message) => typeof message === 'string') ?? null
}

export default api
