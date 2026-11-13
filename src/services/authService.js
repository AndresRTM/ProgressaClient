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

// DELETE /api/user/me  ->  204 raderat | 400 fel lösenord | 404 finns inte | 500
export async function deleteAccount(password) {
  await api.delete('user/me', { data: { password } })
}

export function deleteAccountErrorMessage(error) {
  if (isNetworkError(error)) {
    return "We can't reach Progressa right now. Your account hasn't been deleted."
  }

  if (error?.response?.status === 400) {
    return 'That password isn’t right. Try again.'
  }

  return 'Your account couldn’t be deleted right now. Try again in a moment.'
}

export async function register({
  firstName,
  lastName,
  email,
  age,
  password,
  confirmPassword,
}) {
  const { data } = await api.post('auth/register', {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    age: Number(age),
    password,
    confirmPassword,
  })

  return data
}

export function registerErrorMessage(error) {
  if (isNetworkError(error)) {
    return "We can't reach Progressa right now. Try again."
  }

  switch (error?.response?.status) {
    case 400:
      return (
        firstValidationError(error) ??
        'Please check your information and try again.'
      )
    case 409:
      return 'An account with this email already exists.'
    case 429:
      return 'Too many attempts. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

