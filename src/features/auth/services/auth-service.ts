import { ApiError, apiGet, apiPost, apiPostWithoutBody } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { saveAccessToken } from '../../../lib/auth/session'
import { MOCK_KEYS, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { RegisterInput, SessionUser, User } from '../../../types'
import { tokenResponseSchema, userResponseSchema, type LoginRequest, type RegisterRequest, type TokenResponse, type UserResponse } from '../auth-types'

type LoginInput = {
  email: string
  password: string
}

type AuthenticatedUser = SessionUser & { active: boolean }

function getMockUsers(): User[] {
  return readMockValue(MOCK_KEYS.users, defaultMockUsers)
}

function mapRole(role: UserResponse['rol']): SessionUser['role'] {
  return role === 'Administrator' ? 'admin' : 'lector'
}

function mapUser(response: UserResponse): AuthenticatedUser {
  return {
    id: response.id,
    name: response.nombreCompleto,
    email: response.correo,
    role: mapRole(response.rol),
    backendRole: response.rol,
    status: response.estado,
    active: response.estado === 'Active',
  }
}

async function authenticate(response: TokenResponse): Promise<AuthenticatedUser> {
  const token = parseTokenResponse(response)
  saveAccessToken(token.token, token.expira)
  return getCurrentUserFromApi()
}

export function getCurrentUserFromApi(): Promise<AuthenticatedUser> {
  return apiGet<unknown>(endpoints.me).then((response) => mapUser(parseUserResponse(response)))
}

function parseTokenResponse(response: unknown): TokenResponse {
  const result = tokenResponseSchema.safeParse(response)
  if (!result.success) {
    throw new ApiError('La API devolvió un token inválido.', 502, 'INVALID_API_RESPONSE')
  }
  return result.data
}

function parseUserResponse(response: unknown): UserResponse {
  const result = userResponseSchema.safeParse(response)
  if (!result.success) {
    throw new ApiError('La API devolvió un usuario inválido.', 502, 'INVALID_API_RESPONSE')
  }
  return result.data
}

export function loginUser(input: LoginInput): Promise<AuthenticatedUser> {
  if (dataSource === 'api') {
    return apiPost<unknown, LoginRequest>(endpoints.login, {
      correo: input.email,
      contrasena: input.password,
    }).then((response) => authenticate(parseTokenResponse(response)))
  }

  const user = getMockUsers().find((candidate) => candidate.email === input.email.toLowerCase())

  if (!user || !user.active) {
    return Promise.reject(new Error('Credenciales mock inválidas o usuario inactivo.'))
  }

  return Promise.resolve(user)
}

export function registerUser(input: RegisterInput): Promise<AuthenticatedUser> {
  if (dataSource === 'api') {
    return apiPost<unknown, RegisterRequest>(
      endpoints.register,
      {
        nombreCompleto: input.name,
        correo: input.email,
        contrasena: input.password,
        rol: 'Student',
      },
    ).then((response) => authenticate(parseTokenResponse(response)))
  }

  const users = getMockUsers()
  const normalizedEmail = input.email.toLowerCase()

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return Promise.reject(new Error('El correo ya está registrado.'))
  }

  const newUser: User = {
    id: Math.max(0, ...users.map((user) => user.id)) + 1,
    name: input.name,
    email: normalizedEmail,
    role: 'lector',
    active: true,
  }

  writeMockValue(MOCK_KEYS.users, [newUser, ...users])
  return Promise.resolve({
    ...newUser,
    backendRole: 'Student',
    status: 'Active',
  })
}

export function logoutUser(): Promise<void> {
  if (dataSource === 'api') return apiPostWithoutBody<void>(endpoints.logout)
  return Promise.resolve()
}

export function refreshToken(): Promise<TokenResponse> {
  return apiPostWithoutBody<unknown>(endpoints.refresh).then((response) => {
    const token = parseTokenResponse(response)
    saveAccessToken(token.token, token.expira)
    return token
  })
}

export function forgotPassword(): Promise<{ message: string }> {
  return apiPostWithoutBody<{ message: string }>(endpoints.forgotPassword)
}

export function resetPassword(): Promise<{ message: string }> {
  return apiPostWithoutBody<{ message: string }>(endpoints.resetPassword)
}
