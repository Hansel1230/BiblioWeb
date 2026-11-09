import { apiDelete, apiGet, apiPost, apiPut } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockBooks } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { Book, CreateBookInput, UpdateBookInput } from '../../../types'

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
    categoryId: book.idCategoria ?? undefined,
    publisher: book.editorial ?? undefined,
    publicationYear: book.anioPublicacion ?? undefined,
  }
}

function getMockBookId(books: Book[]) {
  return Math.max(0, ...books.map((book) => book.id)) + 1
}

function mapInputToBook(input: CreateBookInput | UpdateBookInput, current?: Book): Book {
  return {
    id: current?.id ?? 0,
    title: input.titulo ?? current?.title ?? '',
    author: input.autor ?? current?.author ?? '',
    category: current?.category ?? 'Sin categoría',
    available: current?.available ?? true,
    ...(input.isbn !== undefined ? { isbn: input.isbn } : current?.isbn ? { isbn: current.isbn } : {}),
    ...(input.descripcion !== undefined ? { description: input.descripcion } : current?.description ? { description: current.description } : {}),
    ...(current?.copies !== undefined ? { copies: current.copies } : {}),
    ...(input.idCategoria !== undefined ? { categoryId: input.idCategoria } : current?.categoryId !== undefined ? { categoryId: current.categoryId } : {}),
    ...(input.editorial !== undefined ? { publisher: input.editorial } : current?.publisher ? { publisher: current.publisher } : {}),
    ...(input.anioPublicacion !== undefined ? { publicationYear: input.anioPublicacion } : current?.publicationYear !== undefined ? { publicationYear: current.publicationYear } : {}),
  }
}

export function getBooks(): Promise<Book[]> {
  return dataSource === 'mock'
    ? Promise.resolve(readMockValue(MOCK_KEYS.books, defaultMockBooks))
    : apiGet<BookResponse[]>(endpoints.books).then((books) => books.map(mapBook))
}

export function createBook(input: CreateBookInput): Promise<Book> {
  if (dataSource === 'api') {
    return apiPost<BookResponse, CreateBookInput>(endpoints.books, input).then(mapBook)
  }

  const books = readMockValue(MOCK_KEYS.books, defaultMockBooks)
  const book = mapInputToBook(input)
  const created = { ...book, id: getMockBookId(books) }
  writeMockValue(MOCK_KEYS.books, [created, ...books])
  return Promise.resolve(created)
}

export function updateBook(id: number, input: UpdateBookInput): Promise<Book> {
  if (dataSource === 'api') {
    return apiPut<void, UpdateBookInput>(`${endpoints.books}/${id}`, input).then(() => getBooks().then((books) => {
      const updated = books.find((book) => book.id === id)
      if (!updated) throw new Error('El libro actualizado no fue encontrado en la respuesta de la API.')
      return updated
    }))
  }

  const books = readMockValue(MOCK_KEYS.books, defaultMockBooks)
  const current = books.find((book) => book.id === id)
  if (!current) return Promise.reject(new Error('El libro no existe.'))
  const updated = mapInputToBook(input, current)
  writeMockValue(MOCK_KEYS.books, books.map((book) => book.id === id ? updated : book))
  return Promise.resolve(updated)
}

export function deleteBook(id: number): Promise<void> {
  if (dataSource === 'api') return apiDelete(`${endpoints.books}/${id}`)

  const books = readMockValue(MOCK_KEYS.books, defaultMockBooks)
  if (!books.some((book) => book.id === id)) return Promise.reject(new Error('El libro no existe.'))
  writeMockValue(MOCK_KEYS.books, books.filter((book) => book.id !== id))
  return Promise.resolve()
}

export function saveMockBooks(books: Book[]): Promise<Book[]> {
  writeMockValue(MOCK_KEYS.books, books)
  return Promise.resolve(books)
}
