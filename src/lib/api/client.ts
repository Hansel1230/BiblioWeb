import { apiBaseUrl } from './config'

export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error('La API no está configurada. Define VITE_API_BASE_URL.')
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(`La API respondió con ${response.status}.`, response.status)
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

export function apiPatch<TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> {
  return apiRequest<TResponse>(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function apiDelete(endpoint: string): Promise<void> {
  return apiRequest<void>(endpoint, { method: 'DELETE' })
}
