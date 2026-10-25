export type DataSource = 'api' | 'mock'

const configuredDataSource = import.meta.env.VITE_DATA_SOURCE

export const dataSource: DataSource = configuredDataSource === 'mock' ? 'mock' : 'api'
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
