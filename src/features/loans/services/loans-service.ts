import { apiGet, apiPost, apiPatchWithoutBody } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import type { BookCopy, CreateLoanInput, Loan, User } from '../../../types'
import { MOCK_KEYS, defaultMockBooks, defaultMockLoans, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'

function readMockLoans(): Loan[] {
  return readMockValue(MOCK_KEYS.loans, defaultMockLoans)
}

type LoanResponse = {
  id: number
  idUsuario: number
  idEjemplar: number
  tituloLibro: string
  fechaPrestamo: string
  fechaVencimiento: string
  fechaDevolucion?: string | null
  estado: 'Active' | 'Returned' | 'Overdue' | 'Cancelled' | number
  renovaciones: number
}

function mapLoan(loan: LoanResponse): Loan {
  const normalizedStatus = typeof loan.estado === 'number'
    ? ['Active', 'Returned', 'Overdue', 'Cancelled'][loan.estado] ?? 'Active'
    : loan.estado
  const status = normalizedStatus === 'Active' ? 'Activo' : normalizedStatus === 'Overdue' ? 'Vencido' : 'Devuelto'
  return {
    id: loan.id,
    userId: loan.idUsuario,
    bookCopyId: loan.idEjemplar,
    userName: `Usuario #${loan.idUsuario}`,
    userEmail: '',
    bookTitle: loan.tituloLibro,
    dueDate: loan.fechaVencimiento,
    loanDate: loan.fechaPrestamo,
    returnedAt: loan.fechaDevolucion ?? undefined,
    renewalCount: loan.renovaciones,
    status,
  }
}

export function getLoans(): Promise<Loan[]> {
  return dataSource === 'mock' ? Promise.resolve(readMockLoans()) : apiGet<LoanResponse[]>(endpoints.loans).then((loans) => loans.map(mapLoan))
}

export function createLoan(input: CreateLoanInput): Promise<Loan> {
  if (dataSource === 'api') {
    return apiPost<LoanResponse, CreateLoanInput>(endpoints.loans, input).then(mapLoan)
  }

  const loans = readMockLoans()
  const books = readMockValue(MOCK_KEYS.books, defaultMockBooks)
  const copies = readMockValue<BookCopy[]>(MOCK_KEYS.copies, [])
  const users = readMockValue<User[]>(MOCK_KEYS.users, defaultMockUsers)
  const copy = copies.find((item) => item.id === input.idEjemplar && item.status === 'available')
  const book = books.find((item) => item.id === copy?.bookId)
  const user = users.find((item) => item.id === input.idUsuario)
  if (!book?.available || !user) return Promise.reject(new Error('El libro no está disponible o el usuario no existe.'))
  const newLoan: Loan = {
    id: Math.max(0, ...loans.map((loan) => loan.id)) + 1,
    userId: input.idUsuario,
    bookCopyId: input.idEjemplar,
    userName: user.name,
    userEmail: user.email,
    bookTitle: book.title,
    dueDate: input.fechaVencimiento,
    status: 'Activo',
  }
  const updatedLoans = [newLoan, ...loans]
  writeMockValue(MOCK_KEYS.loans, updatedLoans)
  writeMockValue(MOCK_KEYS.copies, copies.map((item) => item.id === input.idEjemplar ? { ...item, status: 'loaned' } : item))
  return Promise.resolve(newLoan)
}

export function returnLoan(id: number): Promise<void> {
  if (dataSource === 'api') return apiPatchWithoutBody<void>(`${endpoints.loans}/${id}/return`)
  const loans = readMockLoans()
  const loan = loans.find((item) => item.id === id)
  writeMockValue(MOCK_KEYS.loans, loans.map((item) => item.id === id ? { ...item, status: 'Devuelto' as const, returnedAt: new Date().toISOString() } : item))
  if (loan?.bookCopyId) {
    const copies = readMockValue<BookCopy[]>(MOCK_KEYS.copies, [])
    writeMockValue(MOCK_KEYS.copies, copies.map((item) => item.id === loan.bookCopyId ? { ...item, status: 'available' } : item))
  }
  return Promise.resolve()
}

export function renewLoan(id: number): Promise<void> {
  if (dataSource === 'api') return apiPatchWithoutBody<void>(`${endpoints.loans}/${id}/renew`)
  writeMockValue(MOCK_KEYS.loans, readMockLoans().map((item) => item.id === id ? { ...item, renewalCount: (item.renewalCount ?? 0) + 1, dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) } : item))
  return Promise.resolve()
}
