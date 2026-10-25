export type UserRole = 'admin' | 'lector'

export type DashboardStat = {
  label: string
  value: string
  change: string
  positive: boolean
}

export type DashboardData = {
  stats: DashboardStat[]
  recentActivity: Array<{ id: number; subject: string; description: string }>
  alerts: Array<{ id: number; label: string; detail: string }>
}

export type Book = {
  id: number
  title: string
  author: string
  category: string
  available: boolean
}

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  active: boolean
}

export type Loan = {
  id: number
  userName: string
  userEmail: string
  bookTitle: string
  dueDate: string
  status: 'Activo' | 'Vencido' | 'Devuelto'
}

export type CreateLoanInput = {
  userId: number
  bookId: number
  dueDate: string
}

export type SessionUser = Pick<User, 'name' | 'email' | 'role'>
