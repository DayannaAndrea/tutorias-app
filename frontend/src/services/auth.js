const AUTH_KEY = 'tutorias_access'

export function signIn() {
  sessionStorage.setItem(AUTH_KEY, '1')
}

export function signOut() {
  sessionStorage.removeItem(AUTH_KEY)
}

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}
