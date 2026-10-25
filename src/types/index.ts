export type UserRole = 'admin' | 'lector'

export type CopyStatus = 'available' | 'reserved' | 'loaned' | 'maintenance'

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
  isbn?: string
  description?: string
  copies?: number
}

export type BookCopy = {
  id: number
  bookId: number
  inventoryCode: string
  status: CopyStatus
  location?: string
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
  userId?: number
  bookCopyId?: number
  userName: string
  userEmail: string
  bookTitle: string
  dueDate: string
  status: 'Activo' | 'Vencido' | 'Devuelto'
  loanDate?: string
  returnedAt?: string
  renewalCount?: number
}

export type CreateLoanInput = {
  userId: number
  bookId: number
  dueDate: string
}

export type Reservation = {
  id: number
  userId: number
  bookId: number
  status: 'pending' | 'approved' | 'cancelled' | 'expired'
  createdAt: string
  expiresAt?: string
}

export type Penalty = {
  id: number
  userId: number
  reason: string
  amount?: number
  status: 'pending' | 'paid' | 'waived'
  createdAt: string
  resolvedAt?: string
}

export type CreateReservationInput = {
  bookId: number
}

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type SessionUser = Pick<User, 'name' | 'email' | 'role'>
