export function readMockValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  const savedValue = window.localStorage.getItem(key)

  if (!savedValue) {
    writeMockValue(key, fallback)
    return fallback
  }

  try {
    return JSON.parse(savedValue) as T
  } catch (error) {
    console.error(`Error al leer datos mock (${key}):`, error)
    return fallback
  }
}

export function writeMockValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
