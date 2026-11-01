import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { User } from '../../../types'

type UserResponse = {
  id: number
  nombreCompleto: string
  correo: string
  rol: 'Administrator' | 'Librarian' | 'Reader' | 'Student' | number
  estado: 'Active' | 'Inactive' | 'Blocked' | number
}

function mapRole(role: UserResponse['rol']): User['role'] {
  const normalizedRole = typeof role === 'number'
    ? ['Administrator', 'Librarian', 'Reader', 'Student'][role]
    : role
  return normalizedRole === 'Administrator' || normalizedRole === 'Librarian' ? 'admin' : 'lector'
}

function mapUser(user: UserResponse): User {
  const status = typeof user.estado === 'number'
    ? ['Active', 'Inactive', 'Blocked'][user.estado]
    : user.estado

  return {
    id: user.id,
    name: user.nombreCompleto,
    email: user.correo,
    role: mapRole(user.rol),
    active: status === 'Active',
  }
}

export function getUsers(): Promise<User[]> {
  return dataSource === 'mock'
    ? Promise.resolve(readMockValue(MOCK_KEYS.users, defaultMockUsers))
    : apiGet<UserResponse[]>(endpoints.users).then((users) => users.map(mapUser))
}

export function saveMockUsers(users: User[]): Promise<User[]> {
  writeMockValue(MOCK_KEYS.users, users)
  return Promise.resolve(users)
}
