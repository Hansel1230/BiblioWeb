import type { SessionUser, UserRole } from '../../types'

export const CURRENT_USER_KEY = 'biblioweb-current-user'
export const ACCESS_TOKEN_KEY = 'biblioweb-access-token'
export const TOKEN_EXPIRATION_KEY = 'biblioweb-token-expiration'

const roles: UserRole[] = ['admin', 'lector']

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && roles.includes(value as UserRole)
}

export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const savedUser = window.localStorage.getItem(CURRENT_USER_KEY)

  if (!savedUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(savedUser) as Partial<SessionUser>

    if (
      typeof parsedUser.name !== 'string' ||
      typeof parsedUser.email !== 'string' ||
      !isUserRole(parsedUser.role)
    ) {
      window.localStorage.removeItem(CURRENT_USER_KEY)
      return null
    }

    return {
      ...(typeof parsedUser.id === 'number' ? { id: parsedUser.id } : {}),
      name: parsedUser.name,
      email: parsedUser.email,
      role: parsedUser.role,
      ...(parsedUser.backendRole ? { backendRole: parsedUser.backendRole } : {}),
      ...(parsedUser.status ? { status: parsedUser.status } : {}),
    }
  } catch (error) {
    console.error('Error al leer la sesión actual:', error)
    window.localStorage.removeItem(CURRENT_USER_KEY)
    return null
  }
}

export function saveCurrentUser(user: SessionUser) {
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function saveAccessToken(token: string, expiresAt: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  window.localStorage.setItem(TOKEN_EXPIRATION_KEY, expiresAt)
}

export function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function isAccessTokenExpired(): boolean {
  const expiration = typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_EXPIRATION_KEY)
  return !expiration || Number.isNaN(Date.parse(expiration)) || Date.parse(expiration) <= Date.now()
}

export function clearSession() {
  clearCurrentUser()
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(TOKEN_EXPIRATION_KEY)
}

export function clearCurrentUser() {
  window.localStorage.removeItem(CURRENT_USER_KEY)
}
