
import api, {
  firstValidationError,
  isNetworkError,
} from './api'

// POST /api/auth/forgot-password
export async function forgotPassword(email) {
  await api.post('auth/forgot-password', {
    email: email.trim(),
  })
}

// POST /api/auth/reset-password
export async function resetPassword({
  email,
  token,
  newPassword,
  confirmPassword,
}) {
  await api.post('auth/reset-password', {
    email: email.trim(),
    token,
    newPassword,
    confirmPassword,
  })
}

export function passwordRecoveryErrorMessage(error) {
  if (isNetworkError(error)) {
    return "We can't reach Progressa right now. Please try again."
  }

  const status = error?.response?.status

  if (status === 429) {
    return 'Too many attempts. Please wait 15 minutes and try again.'
  }

  if (status === 400) {
    return (
      firstValidationError(error) ||
      error?.response?.data?.title ||
      'The reset link is invalid or expired.'
    )
  }

  return 'Something went wrong. Please try again later.'
}
