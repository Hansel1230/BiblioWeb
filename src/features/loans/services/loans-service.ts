import { apiGet, apiPost } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import type { CreateLoanInput, Loan } from '../../../types'

const MOCK_LOANS_KEY = 'biblioweb-loans'

const defaultLoans: Loan[] = [
  { id: 1, userName: 'Elena Díaz', userEmail: 'admin@biblio.com', bookTitle: 'El Quijote', dueDate: '2026-10-12', status: 'Activo' },
  { id: 2, userName: 'Pedro Ruiz', userEmail: 'lector@biblio.com', bookTitle: 'La Metamorfosis', dueDate: '2026-10-09', status: 'Vencido' },
  { id: 3, userName: 'María López', userEmail: 'maria@biblio.com', bookTitle: 'Cien años de soledad', dueDate: '2026-10-15', status: 'Devuelto' },
]

function readMockLoans(): Loan[] {
  const savedLoans = window.localStorage.getItem(MOCK_LOANS_KEY)

  if (!savedLoans) {
    window.localStorage.setItem(MOCK_LOANS_KEY, JSON.stringify(defaultLoans))
    return defaultLoans
  }

  try {
    const parsedLoans = JSON.parse(savedLoans) as Loan[]
    return Array.isArray(parsedLoans) ? parsedLoans : []
  } catch (error) {
    console.error('Error al leer préstamos mock:', error)
    return []
  }
}

export function getLoans(): Promise<Loan[]> {
  return dataSource === 'mock' ? Promise.resolve(readMockLoans()) : apiGet<Loan[]>(endpoints.loans)
}

export function createLoan(input: CreateLoanInput): Promise<Loan> {
  if (dataSource === 'api') {
    return apiPost<Loan, CreateLoanInput>(endpoints.loans, input)
  }

  const loans = readMockLoans()
  const newLoan: Loan = {
    id: Math.max(0, ...loans.map((loan) => loan.id)) + 1,
    userName: `Usuario ${input.userId}`,
    userEmail: '',
    bookTitle: `Libro ${input.bookId}`,
    dueDate: input.dueDate,
    status: 'Activo',
  }
  const updatedLoans = [newLoan, ...loans]
  window.localStorage.setItem(MOCK_LOANS_KEY, JSON.stringify(updatedLoans))
  return Promise.resolve(newLoan)
}
