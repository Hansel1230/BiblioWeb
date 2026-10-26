import { apiGet, apiPost } from '../../../lib/api/client'
import { dataSource } from '../../../lib/api/config'
import { endpoints } from '../../../lib/api/endpoints'
import { getCurrentUser } from '../../../lib/auth/session'
import { MOCK_KEYS } from '../../../mocks/data'
import { readMockValue, writeMockValue } from '../../../mocks/storage'
import type { CreateReservationInput, Reservation, User } from '../../../types'

function currentMockUserId() {
  const currentUser = getCurrentUser()
  const users = readMockValue<User[]>(MOCK_KEYS.users, [])
  return users.find((user) => user.email.toLowerCase() === currentUser?.email.toLowerCase())?.id
}

export function getReservations(): Promise<Reservation[]> {
  if (dataSource === 'api') return apiGet<Reservation[]>(endpoints.reservations)
  const userId = currentMockUserId()
  return Promise.resolve(readMockValue<Reservation[]>(MOCK_KEYS.reservations, []).filter((item) => item.userId === userId))
}

export function createReservation(input: CreateReservationInput): Promise<Reservation> {
  if (dataSource === 'api') return apiPost<Reservation, CreateReservationInput>(endpoints.reservations, input)
  const reservations = readMockValue<Reservation[]>(MOCK_KEYS.reservations, [])
  const userId = currentMockUserId()
  if (!userId) return Promise.reject(new Error('Debes iniciar sesión para reservar.'))
  if (reservations.some((item) => item.userId === userId && item.bookId === input.bookId && ['pending', 'approved'].includes(item.status))) {
    return Promise.reject(new Error('Ya existe una reserva para este libro.'))
  }
  const reservation: Reservation = {
    id: Math.max(0, ...reservations.map((item) => item.id)) + 1,
    userId,
    bookId: input.bookId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  writeMockValue(MOCK_KEYS.reservations, [reservation, ...reservations])
  return Promise.resolve(reservation)
}

export function cancelReservation(id: number): Promise<void> {
  if (dataSource === 'api') return apiPost<void, { status: Reservation['status'] }>(`${endpoints.reservations}/${id}/cancel`, { status: 'cancelled' })
  const updated = readMockValue<Reservation[]>(MOCK_KEYS.reservations, []).map((item) => item.id === id ? { ...item, status: 'cancelled' as const } : item)
  writeMockValue(MOCK_KEYS.reservations, updated)
  return Promise.resolve()
}
