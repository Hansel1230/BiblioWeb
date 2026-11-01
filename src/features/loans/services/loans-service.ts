import { apiGet, apiPost } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import type { CreateLoanInput, Loan, User } from '../../../types'
import { MOCK_KEYS, defaultMockBooks, defaultMockLoans, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'

function readMockLoans(): Loan[] {
  return readMockValue(MOCK_KEYS.loans, defaultMockLoans)
}

export function getLoans(): Promise<Loan[]> {
  return dataSource === 'mock' ? Promise.resolve(readMockLoans()) : apiGet<Loan[]>(endpoints.loans)
}

export function createLoan(input: CreateLoanInput): Promise<Loan> {
  if (dataSource === 'api') {
    return apiPost<Loan, CreateLoanInput>(endpoints.loans, input)
  }

  const loans = readMockLoans()
  const books = readMockValue(MOCK_KEYS.books, defaultMockBooks)
  const users = readMockValue<User[]>(MOCK_KEYS.users, defaultMockUsers)
  const book = books.find((item) => item.id === input.bookId)
  const user = users.find((item) => item.id === input.userId)
  if (!book?.available || !user) return Promise.reject(new Error('El libro no está disponible o el usuario no existe.'))
  const newLoan: Loan = {
    id: Math.max(0, ...loans.map((loan) => loan.id)) + 1,
    userId: input.userId,
    bookCopyId: input.bookId,
    userName: user.name,
    userEmail: user.email,
    bookTitle: book.title,
    dueDate: input.dueDate,
    status: 'Activo',
  }
  const updatedLoans = [newLoan, ...loans]
  writeMockValue(MOCK_KEYS.loans, updatedLoans)
  writeMockValue(MOCK_KEYS.books, books.map((item) => item.id === book.id ? { ...item, available: false } : item))
  return Promise.resolve(newLoan)
}

export function returnLoan(id: number): Promise<void> {
  if (dataSource === 'api') return apiPost<void, Record<string, never>>(`${endpoints.loans}/${id}/return`, {})
  const loans = readMockLoans()
  const loan = loans.find((item) => item.id === id)
  writeMockValue(MOCK_KEYS.loans, loans.map((item) => item.id === id ? { ...item, status: 'Devuelto' as const, returnedAt: new Date().toISOString() } : item))
  if (loan?.bookCopyId) {
    const books = readMockValue(MOCK_KEYS.books, defaultMockBooks)
    writeMockValue(MOCK_KEYS.books, books.map((item) => item.id === loan.bookCopyId ? { ...item, available: true } : item))
  }
  return Promise.resolve()
}

export function renewLoan(id: number): Promise<void> {
  if (dataSource === 'api') return apiPost<void, Record<string, never>>(`${endpoints.loans}/${id}/renew`, {})
  writeMockValue(MOCK_KEYS.loans, readMockLoans().map((item) => item.id === id ? { ...item, renewalCount: (item.renewalCount ?? 0) + 1, dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10) } : item))
  return Promise.resolve()
}
