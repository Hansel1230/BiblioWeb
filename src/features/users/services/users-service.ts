import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { BackendRole, BackendUserStatus, BackendUserStatusCode, CreateUserInput, UpdateUserInput, User } from '../../../types'

type UserResponse = {
  id: number
  nombreCompleto: string
  correo: string
  rol: 'Administrator' | 'Librarian' | 'Reader' | 'Student' | number
  estado: 'Active' | 'Inactive' | 'Blocked' | number
}

type UserRoleResponse = BackendRole | number
type UserStatusResponse = BackendUserStatus | number

const backendRoles: BackendRole[] = ['Administrator', 'Librarian', 'Reader']
const backendStatuses: BackendUserStatus[] = ['Active', 'Inactive', 'Blocked']
const statusCodes: Record<BackendUserStatus, BackendUserStatusCode> = {
  Active: 0,
  Inactive: 1,
  Blocked: 2,
}

function normalizeRole(role: UserRoleResponse): BackendRole {
  return typeof role === 'number' ? backendRoles[role] ?? 'Reader' : role
}

function normalizeStatus(status: UserStatusResponse): BackendUserStatus {
  return typeof status === 'number' ? backendStatuses[status] ?? 'Inactive' : status
}

function mapRole(role: UserResponse['rol']): User['role'] {
  const normalizedRole = typeof role === 'number'
    ? ['Administrator', 'Librarian', 'Reader'][role]
    : role
  return normalizedRole === 'Administrator' || normalizedRole === 'Librarian' ? 'admin' : 'lector'
}

function mapUser(user: UserResponse): User {
  const backendRole = normalizeRole(user.rol)
  const status = normalizeStatus(user.estado)

  return {
    id: user.id,
    name: user.nombreCompleto,
    email: user.correo,
    role: mapRole(backendRole),
    active: status === 'Active',
    backendRole,
    status,
  }
}

export function getUsers(): Promise<User[]> {
  return dataSource === 'mock'
    ? Promise.resolve(readMockValue(MOCK_KEYS.users, defaultMockUsers))
    : apiGet<UserResponse[]>(endpoints.users).then((users) => users.map(mapUser))
}

export function getUser(id: number): Promise<User> {
  return dataSource === 'api'
    ? apiGet<UserResponse>(`${endpoints.users}/${id}`).then(mapUser)
    : getUsers().then((users) => {
      const user = users.find((item) => item.id === id)
      if (!user) throw new Error('El usuario no existe.')
      return user
    })
}

export function createUser(input: CreateUserInput): Promise<User> {
  if (dataSource === 'api') return apiPost<UserResponse, CreateUserInput>(endpoints.users, input).then(mapUser)
  const users = readMockValue(MOCK_KEYS.users, defaultMockUsers)
  const email = input.correo.toLowerCase()
  if (users.some((user) => user.email.toLowerCase() === email)) return Promise.reject(new Error('El correo ya está registrado.'))
  const status: BackendUserStatus = 'Active'
  const created: User = {
    id: Math.max(0, ...users.map((user) => user.id)) + 1,
    name: input.nombreCompleto,
    email,
    role: mapRole(normalizeRole(input.rol)),
    backendRole: normalizeRole(input.rol),
    status,
    active: true,
  }
  writeMockValue(MOCK_KEYS.users, [created, ...users])
  return Promise.resolve(created)
}

export function updateUser(id: number, input: UpdateUserInput): Promise<User> {
  if (dataSource === 'api') return apiPut<UserResponse, UpdateUserInput>(`${endpoints.users}/${id}`, input).then(mapUser)
  const users = readMockValue(MOCK_KEYS.users, defaultMockUsers)
  const current = users.find((user) => user.id === id)
  if (!current) return Promise.reject(new Error('El usuario no existe.'))
  const backendRole = input.rol !== undefined
    ? normalizeRole(input.rol)
    : current.backendRole ?? (current.role === 'admin' ? 'Administrator' : 'Reader')
  const status = input.estado !== undefined
    ? normalizeStatus(input.estado)
    : current.status ?? (current.active ? 'Active' : 'Inactive')
  const updated: User = {
    ...current,
    ...(input.nombreCompleto !== undefined ? { name: input.nombreCompleto } : {}),
    ...(input.correo !== undefined ? { email: input.correo.toLowerCase() } : {}),
    role: mapRole(backendRole),
    backendRole,
    status,
    active: status === 'Active',
  }
  writeMockValue(MOCK_KEYS.users, users.map((user) => user.id === id ? updated : user))
  return Promise.resolve(updated)
}

export function updateUserStatus(id: number, estado: BackendUserStatus): Promise<void> {
  if (dataSource === 'api') return apiPatch<void, { estado: BackendUserStatusCode }>(`${endpoints.users}/${id}/status`, { estado: statusCodes[estado] })
  return updateUser(id, { estado: statusCodes[estado] }).then(() => undefined)
}

export function deleteUser(id: number): Promise<void> {
  if (dataSource === 'api') return apiDelete(`${endpoints.users}/${id}`)
  return updateUserStatus(id, 'Inactive')
}

export function saveMockUsers(users: User[]): Promise<User[]> {
  writeMockValue(MOCK_KEYS.users, users)
  return Promise.resolve(users)
}
