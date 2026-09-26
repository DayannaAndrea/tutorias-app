const AUTH_KEY = 'tutorias_access'
const USER_KEY = 'tutorias_user'
const ACCOUNTS_KEY = 'tutorias_accounts'

function normalizeRole(role) {
  return role === 'tutor' ? 'tutor' : 'estudiante'
}

export function getAccounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}')
    return stored && typeof stored === 'object' ? stored : {}
  } catch {
    return {}
  }
}

export function saveAccount({ name, email, role, subjects = [] }) {
  const accounts = getAccounts()
  const key = email.trim().toLowerCase()
  const normalizedRole = normalizeRole(role)
  const normalizedSubjects = Array.isArray(subjects)
    ? subjects.map((item) => String(item).trim()).filter(Boolean)
    : typeof subjects === 'string'
      ? subjects.split(',').map((item) => item.trim()).filter(Boolean)
      : []

  accounts[key] = {
    name: name.trim(),
    email: key,
    role: normalizedRole,
    subjects: normalizedRole === 'tutor' ? normalizedSubjects : [],
  }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  return accounts[key]
}

export function getAccountByEmail(email) {
  return getAccounts()[email.trim().toLowerCase()] || null
}

export function signIn({ name = '', email = '', role } = {}) {
  const cleanEmail = email.trim().toLowerCase()
  const savedAccount = getAccountByEmail(cleanEmail)
  const user = {
    name: name.trim() || savedAccount?.name || 'Usuario',
    email: cleanEmail,
    role: normalizeRole(role || savedAccount?.role),
  }

  sessionStorage.setItem(AUTH_KEY, '1')
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function signOut() {
  sessionStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null')
    if (!user || typeof user !== 'object') return null
    return {
      ...user,
      role: normalizeRole(user.role),
    }
  } catch {
    return null
  }
}

export function getCurrentRole() {
  return getCurrentUser()?.role || null
}

export function getHomePath() {
  return getCurrentRole() === 'tutor' ? '/solicitudes-recibidas' : '/tutores'
}
