import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { defaultMockDashboard } from '../../../mocks/data'
import type { DashboardData } from '../../../types'

type DashboardSummaryResponse = {
  activeLoans?: number
  availableBooks?: number
  activeUsers?: number
  overdueLoans?: number
  recentActivity?: DashboardData['recentActivity']
  alerts?: DashboardData['alerts']
}

function mapDashboardSummary(response: DashboardSummaryResponse): DashboardData {
  const activeLoans = response.activeLoans ?? 0
  const availableBooks = response.availableBooks ?? 0
  const activeUsers = response.activeUsers ?? 0
  const overdueLoans = response.overdueLoans ?? 0

  return {
    stats: [
      { label: 'Préstamos activos', value: activeLoans.toLocaleString('es-DO'), change: '', positive: true },
      { label: 'Libros disponibles', value: availableBooks.toLocaleString('es-DO'), change: '', positive: true },
      { label: 'Usuarios activos', value: activeUsers.toLocaleString('es-DO'), change: '', positive: true },
      { label: 'Retrasos', value: overdueLoans.toLocaleString('es-DO'), change: '', positive: overdueLoans === 0 },
    ],
    recentActivity: Array.isArray(response.recentActivity) ? response.recentActivity : [],
    alerts: Array.isArray(response.alerts) ? response.alerts : [],
  }
}

export function getDashboard(): Promise<DashboardData> {
  return dataSource === 'mock'
    ? Promise.resolve(defaultMockDashboard)
    : apiGet<DashboardSummaryResponse>(endpoints.dashboard).then(mapDashboardSummary)
}
