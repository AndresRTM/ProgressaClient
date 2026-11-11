import api, { firstValidationError, isNetworkError } from './api'

// POST /api/auth/login  ->  200 { token, userId, email } | 401 vid fel uppgifter
export async function login({ email, password }) {
  const { data } = await api.post('auth/login', { email: email.trim(), password })

  if (!data?.token || !data?.userId) {
    throw new Error('Unexpected login response from the server.')
  }

  return { token: data.token, userId: data.userId, email: data.email }
}

export function loginErrorMessage(error) {
  if (isNetworkError(error)) {
    return "We can't reach Progressa right now. Check your connection and try again."
  }

  switch (error?.response?.status) {
    case 401:
      return 'That email and password don’t match. Try again.'
    case 400:
      return firstValidationError(error) ?? 'Check your email and password and try again.'
    case 429:
      return 'Too many attempts. Wait a few minutes and try again.'
    default:
      return 'Something went wrong on our side. Try again in a moment.'
  }
}
