import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// { user, isAuthenticated, signedOutReason, login, logout, deleteAccount }
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('Use AuthProvider around the app.')
  return context
}
