import { apiGet } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { MOCK_KEYS, defaultMockUsers } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { User } from '../../../types'

export function getUsers(): Promise<User[]> {
  return dataSource === 'mock' ? Promise.resolve(readMockValue(MOCK_KEYS.users, defaultMockUsers)) : apiGet<User[]>(endpoints.users)
}

export function saveMockUsers(users: User[]): Promise<User[]> {
  writeMockValue(MOCK_KEYS.users, users)
  return Promise.resolve(users)
}
