import { beforeEach, describe, expect, it, vi } from 'vitest'

const bookResponse = {
  id: 7,
  isbn: '9780000000000',
  titulo: 'Libro de prueba',
  autor: 'Autor de prueba',
  idCategoria: 2,
  categoria: 'Tecnología',
  editorial: 'Editorial',
  anioPublicacion: 2026,
  descripcion: 'Descripción',
  totalEjemplares: 2,
  ejemplaresDisponibles: 1,
}

describe('books service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  it('creates a book using the documented DTO', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(bookResponse), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { createBook } = await import('./books-service')

    await expect(createBook({
      titulo: 'Libro de prueba',
      autor: 'Autor de prueba',
      idCategoria: 2,
    })).resolves.toMatchObject({ id: 7, title: 'Libro de prueba' })

    const request = fetchMock.mock.calls[0][1] as RequestInit
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/books')
    expect(request.method).toBe('POST')
    expect(JSON.parse(String(request.body))).toMatchObject({
      titulo: 'Libro de prueba',
      autor: 'Autor de prueba',
      idCategoria: 2,
    })
  })

  it('updates a book with PUT and refreshes the catalog after 204', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([bookResponse]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    vi.stubGlobal('fetch', fetchMock)
    const { updateBook } = await import('./books-service')

    await expect(updateBook(7, { titulo: 'Libro actualizado' })).resolves.toMatchObject({
      id: 7,
      title: 'Libro de prueba',
    })
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/books/7')
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('PUT')
  })

  it('deletes a book through the documented endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { deleteBook } = await import('./books-service')

    await expect(deleteBook(7)).resolves.toBeUndefined()
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/books/7')
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('DELETE')
  })
})
