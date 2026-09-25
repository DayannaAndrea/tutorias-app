import { createContext, useContext, useMemo, useState } from 'react'
import { clearAccessToken, setAccessToken } from '../services/api.js'

const AUTH_KEY = 'tutorias_demo_accounts'
const SESSION_KEY = 'tutorias_demo_session'

const DEFAULT_ACCOUNT = {
  name: 'Estudiante Demo',
  email: 'estudiante@tutorias.edu.co',
  password: '12345678',
  role: 'estudiante',
}

function readAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
    if (Array.isArray(saved) && saved.length) return saved
  } catch {
    return [DEFAULT_ACCOUNT]
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify([DEFAULT_ACCOUNT]))
  return [DEFAULT_ACCOUNT]
}

function readSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    return saved?.email ? saved : null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const login = async (email, password) => {
    const account = readAccounts().find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
    )

    if (!account) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const nextUser = {
      name: account.name,
      email: account.email,
      role: account.role,
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    setAccessToken('demo-session-token')
    return nextUser
  }

  const register = async ({ name, email, password }) => {
    const accounts = readAccounts()
    const normalizedEmail = email.trim().toLowerCase()

    if (accounts.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      throw new Error('EMAIL_EXISTS')
    }

    const account = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'estudiante',
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify([...accounts, account]))

    const nextUser = {
      name: account.name,
      email: account.email,
      role: account.role,
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    setAccessToken('demo-session-token')
    return nextUser
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
    clearAccessToken()
  }

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
