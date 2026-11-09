import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('copies service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  it('lists copies for a book', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: 10,
      idLibro: 1,
      codigoInventario: 'INV-00010',
      estado: 'Available',
      notas: 'Ejemplar nuevo',
    }]), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    const { getBookCopies } = await import('./copies-service')

    await expect(getBookCopies(1)).resolves.toEqual([{
      id: 10,
      bookId: 1,
      inventoryCode: 'INV-00010',
      status: 'available',
      location: 'Ejemplar nuevo',
    }])
  })

  it('creates, changes status and retires a copy using the API contract', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 11,
        idLibro: 1,
        codigoInventario: 'INV-00011',
        estado: 'Available',
      }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { createBookCopy, updateBookCopyStatus, deleteBookCopy } = await import('./copies-service')

    await createBookCopy(1, { codigoInventario: 'INV-00011', notas: 'Donación' })
    await updateBookCopyStatus(11, 'maintenance')
    await deleteBookCopy(11)

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/books/1/copies')
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST')
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({
      codigoInventario: 'INV-00011',
      notas: 'Donación',
    })
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.test/api/copies/11/status')
    expect(JSON.parse(String((fetchMock.mock.calls[1][1] as RequestInit).body))).toEqual({ estado: 'Maintenance' })
    expect((fetchMock.mock.calls[2][1] as RequestInit).method).toBe('DELETE')
  })
})
