import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockBooks } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { Book } from '../../../types'

export function getBooks(): Promise<Book[]> {
  return dataSource === 'mock'
    ? Promise.resolve(readMockValue(MOCK_KEYS.books, defaultMockBooks))
    : apiGet<Book[]>(endpoints.books)
}

export function saveMockBooks(books: Book[]): Promise<Book[]> {
  writeMockValue(MOCK_KEYS.books, books)
  return Promise.resolve(books)
}
