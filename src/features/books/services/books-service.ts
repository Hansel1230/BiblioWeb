import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockBooks } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { Book } from '../../../types'

type BookResponse = {
  id: number
  isbn?: string | null
  titulo: string
  autor: string
  editorial?: string | null
  anioPublicacion?: number | null
  descripcion?: string | null
  idCategoria?: number | null
  categoria?: string | null
  totalEjemplares?: number
  ejemplaresDisponibles?: number
}

function mapBook(book: BookResponse): Book {
  return {
    id: book.id,
    title: book.titulo,
    author: book.autor,
    category: book.categoria ?? 'Sin categoría',
    available: (book.ejemplaresDisponibles ?? 0) > 0,
    isbn: book.isbn ?? undefined,
    description: book.descripcion ?? undefined,
    copies: book.totalEjemplares ?? 0,
  }
}

export function getBooks(): Promise<Book[]> {
  return dataSource === 'mock'
    ? Promise.resolve(readMockValue(MOCK_KEYS.books, defaultMockBooks))
    : apiGet<BookResponse[]>(endpoints.books).then((books) => books.map(mapBook))
}

export function saveMockBooks(books: Book[]): Promise<Book[]> {
  writeMockValue(MOCK_KEYS.books, books)
  return Promise.resolve(books)
}
