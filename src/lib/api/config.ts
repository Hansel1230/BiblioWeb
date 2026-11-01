export type DataSource = 'api' | 'mock'

const configuredDataSource = import.meta.env.VITE_DATA_SOURCE

export const dataSource: DataSource = configuredDataSource === 'mock' ? 'mock' : 'api'
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
export const apiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10_000)
