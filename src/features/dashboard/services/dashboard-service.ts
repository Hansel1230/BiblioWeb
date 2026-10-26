import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { defaultMockDashboard } from '../../../mocks/data'
import type { DashboardData } from '../../../types'

export function getDashboard(): Promise<DashboardData> {
  return dataSource === 'mock'
    ? Promise.resolve(defaultMockDashboard)
    : apiGet<DashboardData>(endpoints.dashboard)
}
