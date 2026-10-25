const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function apiGet<T>(endpoint: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('La API no está configurada. Define VITE_API_BASE_URL.')
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export async function apiPost<TResponse, TBody>(endpoint: string, body: TBody): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error('La API no está configurada. Define VITE_API_BASE_URL.')
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`)
  }

  return response.json() as Promise<TResponse>
}
