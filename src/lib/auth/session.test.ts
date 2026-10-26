import { beforeEach, describe, expect, it } from 'vitest'
import {
  CURRENT_USER_KEY,
  clearCurrentUser,
  getCurrentUser,
  saveCurrentUser,
} from './session'

describe('session helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves and reads a valid session without credentials', () => {
    const user = { name: 'Ana', email: 'ana@example.com', role: 'lector' as const }

    saveCurrentUser(user)

    expect(getCurrentUser()).toEqual(user)
    expect(window.localStorage.getItem(CURRENT_USER_KEY)).not.toContain('password')
  })

  it('clears malformed sessions instead of throwing', () => {
    window.localStorage.setItem(CURRENT_USER_KEY, '{invalid')

    expect(getCurrentUser()).toBeNull()
    expect(window.localStorage.getItem(CURRENT_USER_KEY)).toBeNull()
  })

  it('clears a valid session on logout', () => {
    saveCurrentUser({ name: 'Ana', email: 'ana@example.com', role: 'lector' })

    clearCurrentUser()

    expect(getCurrentUser()).toBeNull()
  })
})
