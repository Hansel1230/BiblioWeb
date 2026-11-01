import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { dataSource } from '../../lib/api/config'
import { clearSession, getCurrentUser, getAccessToken, isAccessTokenExpired, saveCurrentUser } from '../../lib/auth/session'
import { getCurrentUserFromApi, loginUser, logoutUser, refreshToken, registerUser } from './services/auth-service'
import type { AuthContextValue } from './auth-context-definition'
import { AuthContext } from './auth-context-definition'
import type { SessionUser } from '../../types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const hydrate = async () => {
      if (dataSource === 'mock') {
        if (active) setUser(getCurrentUser())
        setIsLoading(false)
        return
      }
      if (!getAccessToken() || isAccessTokenExpired()) {
        clearSession()
        if (active) setUser(null)
        setIsLoading(false)
        return
      }
      try {
        const currentUser = await getCurrentUserFromApi()
        if (active) {
          saveCurrentUser(currentUser)
          setUser(currentUser)
        }
      } catch {
        clearSession()
        if (active) setUser(null)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void hydrate()
    return () => { active = false }
  }, [])

  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser())
    const handleUnauthorized = () => {
      const from = `${window.location.pathname}${window.location.search}`
      clearSession()
      queryClient.clear()
      setUser(null)
      if (!['/login', '/register'].includes(window.location.pathname)) {
        navigate(`/login?from=${encodeURIComponent(from)}`, { replace: true })
      }
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('biblioweb:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('biblioweb:unauthorized', handleUnauthorized)
    }
  }, [navigate, queryClient])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: user !== null,
    async login(email, password) {
      queryClient.clear()
      const currentUser = await loginUser({ email, password })
      saveCurrentUser(currentUser)
      setUser(currentUser)
    },
    async register(input) {
      queryClient.clear()
      const currentUser = await registerUser(input)
      saveCurrentUser(currentUser)
      setUser(currentUser)
    },
    async logout() {
      try {
        await logoutUser()
      } finally {
        clearSession()
        queryClient.clear()
        setUser(null)
      }
    },
    async refresh() {
      if (dataSource === 'mock') {
        setUser(getCurrentUser())
        return
      }
      await refreshToken()
      const currentUser = await getCurrentUserFromApi()
      saveCurrentUser(currentUser)
      setUser(currentUser)
    },
  }), [isLoading, queryClient, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
