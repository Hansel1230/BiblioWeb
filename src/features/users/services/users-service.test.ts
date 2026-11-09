import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('users service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  it('creates a user with the backend role', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: 4, nombreCompleto: 'Carlos Gómez', correo: 'carlos@example.com', rol: 'Reader', estado: 'Active',
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { createUser } = await import('./users-service')

    await expect(createUser({
      nombreCompleto: 'Carlos Gómez',
      correo: 'carlos@example.com',
      contrasena: 'ClaveSegura123!',
      rol: 2,
    })).resolves.toMatchObject({ id: 4, backendRole: 'Reader', role: 'lector' })
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toMatchObject({ rol: 2 })
  })

  it('updates, changes status and deactivates a user', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        id: 4, nombreCompleto: 'Carlos', correo: 'carlos@example.com', rol: 'Librarian', estado: 'Active',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { updateUser, updateUserStatus, deleteUser } = await import('./users-service')

    await updateUser(4, { rol: 1 })
    await updateUserStatus(4, 'Blocked')
    await deleteUser(4)

    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('PUT')
    expect(JSON.parse(String((fetchMock.mock.calls[1][1] as RequestInit).body))).toEqual({ estado: 2 })
    expect((fetchMock.mock.calls[2][1] as RequestInit).method).toBe('DELETE')
  })
})
