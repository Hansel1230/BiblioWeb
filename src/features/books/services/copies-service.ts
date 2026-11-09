import { apiDelete, apiGet, apiPatch, apiPost } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { defaultMockCopies, MOCK_KEYS } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { BookCopy, CopyStatus, CreateBookCopyInput } from '../../../types'

type CopyResponse = {
  id: number
  idLibro: number
  codigoInventario: string
  estado: 'Available' | 'Reserved' | 'OnLoan' | 'Maintenance' | 'Retired'
  notas?: string | null
}

const backendStatus: Record<CopyStatus, CopyResponse['estado']> = {
  available: 'Available',
  reserved: 'Reserved',
  loaned: 'OnLoan',
  maintenance: 'Maintenance',
  retired: 'Retired',
}

const frontendStatus: Record<CopyResponse['estado'], CopyStatus> = {
  Available: 'available',
  Reserved: 'reserved',
  OnLoan: 'loaned',
  Maintenance: 'maintenance',
  Retired: 'retired',
}

function mapStatus(status: CopyResponse['estado']): CopyStatus {
  return frontendStatus[status]
}

function mapCopy(copy: CopyResponse): BookCopy {
  return {
    id: copy.id,
    bookId: copy.idLibro,
    inventoryCode: copy.codigoInventario,
    status: mapStatus(copy.estado),
    location: copy.notas ?? undefined,
  }
}

function mockCopies() {
  return readMockValue(MOCK_KEYS.copies, defaultMockCopies)
}

export function getBookCopies(bookId: number): Promise<BookCopy[]> {
  if (dataSource === 'api') {
    return apiGet<CopyResponse[]>(`${endpoints.books}/${bookId}/copies`).then((copies) => copies.map(mapCopy))
  }

  return Promise.resolve(mockCopies().filter((copy) => copy.bookId === bookId))
}

export function getBookCopy(id: number): Promise<BookCopy> {
  if (dataSource === 'api') return apiGet<CopyResponse>(`${endpoints.copies}/${id}`).then(mapCopy)
  const copy = mockCopies().find((item) => item.id === id)
  return copy ? Promise.resolve(copy) : Promise.reject(new Error('El ejemplar no existe.'))
}

export function createBookCopy(bookId: number, input: CreateBookCopyInput): Promise<BookCopy> {
  if (dataSource === 'api') {
    return apiPost<CopyResponse, CreateBookCopyInput>(`${endpoints.books}/${bookId}/copies`, input).then(mapCopy)
  }
  const copies = mockCopies()
  const created: BookCopy = {
    id: Math.max(0, ...copies.map((copy) => copy.id)) + 1,
    bookId,
    inventoryCode: input.codigoInventario,
    status: 'available',
    location: input.notas,
  }
  writeMockValue(MOCK_KEYS.copies, [...copies, created])
  return Promise.resolve(created)
}

export function updateBookCopyStatus(id: number, status: CopyStatus): Promise<void> {
  if (dataSource === 'api') {
    return apiPatch<void, { estado: CopyResponse['estado'] }>(`${endpoints.copies}/${id}/status`, { estado: backendStatus[status] })
  }
  const copies = mockCopies()
  if (!copies.some((copy) => copy.id === id)) return Promise.reject(new Error('El ejemplar no existe.'))
  writeMockValue(MOCK_KEYS.copies, copies.map((copy) => copy.id === id ? { ...copy, status } : copy))
  return Promise.resolve()
}

export function deleteBookCopy(id: number): Promise<void> {
  if (dataSource === 'api') return apiDelete(`${endpoints.copies}/${id}`)
  const copies = mockCopies()
  if (!copies.some((copy) => copy.id === id)) return Promise.reject(new Error('El ejemplar no existe.'))
  writeMockValue(MOCK_KEYS.copies, copies.map((copy) => copy.id === id ? { ...copy, status: 'retired' } : copy))
  return Promise.resolve()
}
