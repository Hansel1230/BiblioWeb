export type UserRole = 'admin' | 'lector'
export type BackendRole = 'Administrator' | 'Librarian' | 'Reader' | 'Student'
export type BackendUserStatus = 'Active' | 'Inactive' | 'Blocked'
export type BackendRoleCode = 0 | 1 | 2 | 3
export type BackendUserStatusCode = 0 | 1 | 2

export type CopyStatus = 'available' | 'reserved' | 'loaned' | 'maintenance' | 'retired'

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
  categoryId?: number
  publisher?: string
  publicationYear?: number
}

export type Category = {
  id: number
  name: string
}

export type CreateBookInput = {
  isbn?: string
  titulo: string
  autor: string
  idCategoria?: number
  editorial?: string
  anioPublicacion?: number
  descripcion?: string
}

export type UpdateBookInput = Partial<CreateBookInput> & {
  estaActivo?: boolean
}

export type BookCopy = {
  id: number
  bookId: number
  inventoryCode: string
  status: CopyStatus
  location?: string
}

export type CreateBookCopyInput = {
  codigoInventario: string
  notas?: string
}

export type User = {
  id: number
  name: string
  email: string
  role: UserRole
  active: boolean
  backendRole?: BackendRole
  status?: BackendUserStatus
}

export type CreateUserInput = {
  nombreCompleto: string
  correo: string
  contrasena: string
  rol: BackendRoleCode
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'contrasena'>> & {
  estado?: BackendUserStatusCode
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

export type SessionUser = {
  id?: number
  name: string
  email: string
  role: UserRole
  backendRole?: BackendRole
  status?: BackendUserStatus
}
