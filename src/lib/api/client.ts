import { apiBaseUrl, apiTimeoutMs } from './config'
import { clearSession, getAccessToken, saveAccessToken } from '../auth/session'
import { endpoints } from './endpoints'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: string[]

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: string[],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

type TokenPayload = {
  token?: unknown
  expira?: unknown
}

function notifyUnauthorized() {
  clearSession()
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('biblioweb:unauthorized'))
}

async function requestAccessToken(): Promise<boolean> {
  const currentToken = getAccessToken()
  const headers = new Headers({ Accept: 'application/json' })
  if (currentToken) headers.set('Authorization', `Bearer ${currentToken}`)
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${endpoints.refresh}`, {
    method: 'POST',
    headers,
    credentials: 'include',
  })

  if (!response.ok) return false
  const payload = await response.json() as TokenPayload
  if (typeof payload.token !== 'string' || typeof payload.expira !== 'string') return false
  saveAccessToken(payload.token, payload.expira)
  return true
}

function createTimeoutSignal(signal: AbortSignal | null | undefined) {
  const controller = new AbortController()
  let timedOut = false
  const timeout = globalThis.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, apiTimeoutMs)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      globalThis.clearTimeout(timeout)
      signal?.removeEventListener('abort', abort)
    },
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit, allowRefresh = true): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('La API no está configurada. Define VITE_API_BASE_URL.')
  }

  const headers = new Headers(options?.headers)
  headers.set('Accept', 'application/json')
  if (options?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const timeout = createTimeoutSignal(options?.signal)
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${endpoint}`, {
      credentials: 'include',
      ...options,
      signal: timeout.signal,
      headers,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        timeout.didTimeout() ? 'La solicitud excedió el tiempo de espera.' : 'La solicitud fue cancelada.',
        0,
        timeout.didTimeout() ? 'TIMEOUT' : 'ABORTED',
      )
    }
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') {
      throw new ApiError(
        timeout.didTimeout() ? 'La solicitud excedió el tiempo de espera.' : 'La solicitud fue cancelada.',
        0,
        timeout.didTimeout() ? 'TIMEOUT' : 'ABORTED',
      )
    }
    throw new ApiError('No se pudo conectar con la API.', 0, 'NETWORK_ERROR')
  } finally {
    timeout.cleanup()
  }

  if (!response.ok) {
    if (response.status === 401 && allowRefresh && Boolean(token) && endpoint !== endpoints.refresh) {
      try {
        if (await requestAccessToken()) return apiRequest(endpoint, options, false)
      } catch {
        // The original 401 remains the actionable error when refresh fails.
      }
    }
    let message = `La API respondió con ${response.status}.`
    let code: string | undefined
    let details: string[] | undefined
    try {
      const errorBody = await response.json() as {
        mensaje?: string
        message?: string
        codigo?: string
        detalles?: string[]
        errors?: Record<string, string[]>
      }
      message = errorBody.mensaje ?? errorBody.message ?? message
      code = errorBody.codigo
      details = errorBody.detalles ?? Object.values(errorBody.errors ?? {}).flat()
    } catch {
      // Some HTTP errors do not include a JSON body.
    }
    if (response.status === 401) notifyUnauthorized()
    throw new ApiError(message, response.status, code, details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint)
}

export function apiPost<TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function apiPostWithoutBody<TResponse>(endpoint: string): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, { method: 'POST' })
}

export function apiPut<TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function apiPatch<TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function apiPatchWithoutBody<TResponse>(endpoint: string): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, { method: 'PATCH' })
}

export function apiDelete(endpoint: string): Promise<void> {
  return apiRequest<void>(endpoint, { method: 'DELETE' })
}
