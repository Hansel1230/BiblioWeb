import type { Book, DashboardData, Loan, User } from '../types'

export const MOCK_KEYS = {
  books: 'biblioweb-mock-books',
  users: 'biblioweb-mock-users',
  loans: 'biblioweb-mock-loans',
  reservations: 'biblioweb-mock-reservations',
} as const

export const defaultMockBooks: Book[] = [
  { id: 1, title: 'El Quijote', author: 'Miguel de Cervantes', category: 'Clásico', isbn: '9788424118174', available: true, copies: 3 },
  { id: 2, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Literatura', isbn: '9780307474728', available: false, copies: 2 },
  { id: 3, title: 'La Metamorfosis', author: 'Franz Kafka', category: 'Ficción', isbn: '9788420674209', available: true, copies: 1 },
]

export const defaultMockUsers: User[] = [
  { id: 1, name: 'Elena Díaz', email: 'admin@biblio.com', role: 'admin', active: true },
  { id: 2, name: 'Pedro Ruiz', email: 'lector@biblio.com', role: 'lector', active: true },
  { id: 3, name: 'Ana García', email: 'ana@biblio.com', role: 'admin', active: false },
]

export const defaultMockLoans: Loan[] = [
  { id: 1, userId: 1, bookCopyId: 1, userName: 'Elena Díaz', userEmail: 'admin@biblio.com', bookTitle: 'El Quijote', dueDate: '2026-10-12', status: 'Activo' },
  { id: 2, userId: 2, bookCopyId: 3, userName: 'Pedro Ruiz', userEmail: 'lector@biblio.com', bookTitle: 'La Metamorfosis', dueDate: '2026-10-09', status: 'Vencido' },
  { id: 3, userId: 2, bookCopyId: 2, userName: 'Pedro Ruiz', userEmail: 'lector@biblio.com', bookTitle: 'Cien años de soledad', dueDate: '2026-10-15', status: 'Devuelto' },
]

export const defaultMockDashboard: DashboardData = {
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
