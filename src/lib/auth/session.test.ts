import { beforeEach, describe, expect, it } from 'vitest'
import {
  CURRENT_USER_KEY,
  ACCESS_TOKEN_KEY,
  TOKEN_EXPIRATION_KEY,
  clearCurrentUser,
  clearSession,
  getCurrentUser,
  getAccessToken,
  isAccessTokenExpired,
  saveAccessToken,
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

  it('stores and reads an access token with its expiration', () => {
    const expiration = new Date(Date.now() + 60_000).toISOString()

    saveAccessToken('token-value', expiration)

    expect(getAccessToken()).toBe('token-value')
    expect(window.localStorage.getItem(TOKEN_EXPIRATION_KEY)).toBe(expiration)
    expect(isAccessTokenExpired()).toBe(false)
  })

  it('clears the complete session', () => {
    saveCurrentUser({ name: 'Ana', email: 'ana@example.com', role: 'lector' })
    saveAccessToken('token-value', new Date(Date.now() + 60_000).toISOString())

    clearSession()

    expect(window.localStorage.getItem(CURRENT_USER_KEY)).toBeNull()
    expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(window.localStorage.getItem(TOKEN_EXPIRATION_KEY)).toBeNull()
  })
})
