export type UserRole = 'admin' | 'lector'

export type DashboardStat = {
  label: string
  value: string
  change: string
  positive: boolean
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

export type SessionUser = Pick<User, 'name' | 'email' | 'role'>
