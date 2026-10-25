import type { SessionUser, UserRole } from '../../types'

export const CURRENT_USER_KEY = 'biblioweb-current-user'

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
      name: parsedUser.name,
      email: parsedUser.email,
      role: parsedUser.role,
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

export function clearCurrentUser() {
  window.localStorage.removeItem(CURRENT_USER_KEY)
}
