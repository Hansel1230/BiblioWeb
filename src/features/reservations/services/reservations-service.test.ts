import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('reservations service API contract', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  it('creates a reservation with user and book ids', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 30, userId: 1, bookId: 2, status: 'Pending', createdAt: '2026-11-09T15:00:00Z',
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { createReservation } = await import('./reservations-service')

    await createReservation({ idUsuario: 1, idLibro: 2 })

    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({ idUsuario: 1, idLibro: 2 })
  })

  it('cancels a reservation with PATCH and no body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { cancelReservation } = await import('./reservations-service')

    await cancelReservation(30)

    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('PATCH')
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBeUndefined()
  })
})
