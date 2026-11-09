import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('loans service API contract', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  it('creates a loan with copy id and UTC expiration', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 20,
      idUsuario: 1,
      idEjemplar: 10,
      tituloLibro: 'Clean Code',
      fechaPrestamo: '2026-11-09T15:00:00Z',
      fechaVencimiento: '2026-11-15T23:59:59.000Z',
      estado: 'Active',
      renovaciones: 0,
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { createLoan } = await import('./loans-service')

    await createLoan({ idUsuario: 1, idEjemplar: 10, fechaVencimiento: '2026-11-15T23:59:59.000Z' })

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/loans')
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({
      idUsuario: 1,
      idEjemplar: 10,
      fechaVencimiento: '2026-11-15T23:59:59.000Z',
    })
  })

  it('uses PATCH without a request body for return and renewal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { returnLoan, renewLoan } = await import('./loans-service')

    await returnLoan(20)
    await renewLoan(20)

    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('PATCH')
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBeUndefined()
    expect((fetchMock.mock.calls[1][1] as RequestInit).method).toBe('PATCH')
  })
})
