import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ACCESS_TOKEN_KEY, TOKEN_EXPIRATION_KEY, saveAccessToken } from '../auth/session'

describe('api client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubEnv('VITE_API_TIMEOUT_MS', '10')
    window.localStorage.clear()
  })

  it('sends the Bearer token and accepts 204 responses', async () => {
    saveAccessToken('access-token', new Date(Date.now() + 60_000).toISOString())
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const { apiPostWithoutBody } = await import('./client')

    await expect(apiPostWithoutBody<void>('/api/auth/logout')).resolves.toBeUndefined()

    const request = fetchMock.mock.calls[0][1] as RequestInit
    const headers = request.headers as Headers
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/auth/logout')
    expect(request.method).toBe('POST')
    expect(headers.get('Authorization')).toBe('Bearer access-token')
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('refreshes once after 401 and retries the original request', async () => {
    saveAccessToken('expired-token', new Date(Date.now() + 60_000).toISOString())
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        token: 'refreshed-token',
        expira: new Date(Date.now() + 60_000).toISOString(),
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    vi.stubGlobal('fetch', fetchMock)
    const { apiGet } = await import('./client')

    await expect(apiGet<{ ok: boolean }>('/api/private')).resolves.toEqual({ ok: true })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    const retryRequest = fetchMock.mock.calls[2][1] as RequestInit
    expect((retryRequest.headers as Headers).get('Authorization')).toBe('Bearer refreshed-token')
  })

  it('reports timeout separately from network errors', async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { apiGet } = await import('./client')

    await expect(apiGet('/api/slow')).rejects.toMatchObject({
      status: 0,
      code: 'TIMEOUT',
    })
  })

  it('clears the session and emits unauthorized after refresh failure', async () => {
    saveAccessToken('expired-token', new Date(Date.now() + 60_000).toISOString())
    const unauthorized = vi.fn()
    window.addEventListener('biblioweb:unauthorized', unauthorized)
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 })))
    const { apiGet } = await import('./client')

    await expect(apiGet('/api/private')).rejects.toMatchObject({ status: 401 })

    expect(unauthorized).toHaveBeenCalledOnce()
    expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull()
    expect(window.localStorage.getItem(TOKEN_EXPIRATION_KEY)).toBeNull()
    window.removeEventListener('biblioweb:unauthorized', unauthorized)
  })
})
