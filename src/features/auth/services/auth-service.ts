import { apiPost } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { RegisterInput, SessionUser, User } from '../../../types'

type LoginInput = {
  email: string
  password: string
}

type AuthenticatedUser = SessionUser & { active: boolean }
type LoginResponse = AuthenticatedUser | { user: AuthenticatedUser }

function getMockUsers(): User[] {
  return readMockValue(MOCK_KEYS.users, defaultMockUsers)
}

export function loginUser(input: LoginInput): Promise<AuthenticatedUser> {
  if (dataSource === 'api') {
    return apiPost<LoginResponse, LoginInput>(endpoints.auth, input).then((response) =>
      'user' in response ? response.user : response,
    )
  }

  const user = getMockUsers().find((candidate) => candidate.email === input.email.toLowerCase())

  if (!user || !user.active) {
    return Promise.reject(new Error('Credenciales mock inválidas o usuario inactivo.'))
  }

  return Promise.resolve(user)
}

export function registerUser(input: RegisterInput): Promise<void> {
  if (dataSource === 'api') {
    return apiPost<void, RegisterInput>(endpoints.register, input)
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
  return Promise.resolve()
}
