import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import type { DashboardData } from '../../../types'

const mockDashboard: DashboardData = {
  stats: [
    { label: 'Préstamos activos', value: '184', change: '+12%', positive: true },
    { label: 'Libros disponibles', value: '1,240', change: '+4%', positive: true },
    { label: 'Usuarios activos', value: '426', change: '+8%', positive: true },
    { label: 'Retrasos', value: '17', change: '-3%', positive: false },
  ],
  recentActivity: [
    { id: 1, subject: 'Elena Díaz', description: 'Prestó “El Quijote”' },
    { id: 2, subject: 'Pedro Ruiz', description: 'Devuelve “La Metamorfosis”' },
    { id: 3, subject: 'María López', description: 'Reservó “Cien años de soledad”' },
  ],
  alerts: [
    { id: 1, label: '3 libros vencidos', detail: 'Prioridad alta' },
    { id: 2, label: '5 libros reservados', detail: 'En proceso' },
    { id: 3, label: '2 usuarios nuevos', detail: 'Hoy' },
  ],
}

export function getDashboard(): Promise<DashboardData> {
  return dataSource === 'mock' ? Promise.resolve(mockDashboard) : apiGet<DashboardData>(endpoints.dashboard)
}
