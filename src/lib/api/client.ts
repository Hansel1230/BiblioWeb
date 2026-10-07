const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.example.com'

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
