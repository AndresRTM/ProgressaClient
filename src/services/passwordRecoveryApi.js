
import api, {
  firstValidationError,
  isNetworkError,
} from './api'

// Request a password reset link
export async function forgotPassword(email) {
  const { data } = await api.post(
    'auth/forgot-password',
    {
      email: email.trim(),
    }
  )

  return data
}

// Reset the user's password
export async function resetPassword({
  email,
  token,
  newPassword,
  confirmPassword,
}) {
  const { data } = await api.post(
    'auth/reset-password',
    {
      email: email.trim(),
      token,
      newPassword,
      confirmPassword,
    }
  )

  return data
}

// Handle password recovery errors
export function passwordRecoveryErrorMessage(
  error,
  operation
) {
  if (isNetworkError(error)) {
    return "We can't reach Progressa right now. Please try again."
  }

  switch (error?.response?.status) {
    case 400:
      return (
        firstValidationError(error) ??
        (
          operation === 'reset'
            ? 'The reset link is invalid or expired. Request a new link.'
            : 'Please check your email address and try again.'
        )
      )

    case 429:
      return 'Too many attempts. Please wait and try again.'

    default:
      return 'Something went wrong. Please try again later.'
  }
}
