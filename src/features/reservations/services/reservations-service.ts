import { apiGet, apiPatchWithoutBody, apiPost } from '../../../lib/api/client'
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
  if (dataSource === 'api') {
    const currentUser = getCurrentUser()
    const endpoint = currentUser?.id && currentUser.role === 'lector'
      ? `${endpoints.users}/${currentUser.id}/reservations`
      : endpoints.reservations
    return apiGet<ReservationResponse[]>(endpoint).then((reservations) => reservations.map(mapReservation))
  }
  const userId = currentMockUserId()
  return Promise.resolve(readMockValue<Reservation[]>(MOCK_KEYS.reservations, []).filter((item) => item.userId === userId))
}

export function createReservation(input: CreateReservationInput): Promise<Reservation> {
  if (dataSource === 'api') return apiPost<ReservationResponse, CreateReservationInput>(endpoints.reservations, input).then(mapReservation)
  const reservations = readMockValue<Reservation[]>(MOCK_KEYS.reservations, [])
  const userId = input.idUsuario
  if (!userId) return Promise.reject(new Error('Debes iniciar sesión para reservar.'))
  if (reservations.some((item) => item.userId === userId && item.bookId === input.idLibro && ['pending', 'approved'].includes(item.status))) {
    return Promise.reject(new Error('Ya existe una reserva para este libro.'))
  }
  const reservation: Reservation = {
    id: Math.max(0, ...reservations.map((item) => item.id)) + 1,
    userId,
    bookId: input.idLibro,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  writeMockValue(MOCK_KEYS.reservations, [reservation, ...reservations])
  return Promise.resolve(reservation)
}

export function cancelReservation(id: number): Promise<void> {
  if (dataSource === 'api') return apiPatchWithoutBody<void>(`${endpoints.reservations}/${id}/cancel`)
  const updated = readMockValue<Reservation[]>(MOCK_KEYS.reservations, []).map((item) => item.id === id ? { ...item, status: 'cancelled' as const } : item)
  writeMockValue(MOCK_KEYS.reservations, updated)
  return Promise.resolve()
}

type ReservationResponse = {
  id: number
  userId: number
  bookId: number
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'PickedUp' | 'Expired'
  createdAt: string
  pickupExpiresAt?: string | null
}

function mapReservation(reservation: ReservationResponse): Reservation {
  const statusMap: Record<ReservationResponse['status'], Reservation['status']> = {
    Pending: 'pending',
    Approved: 'approved',
    Rejected: 'rejected',
    Cancelled: 'cancelled',
    PickedUp: 'pickedUp',
    Expired: 'expired',
  }
  return {
    id: reservation.id,
    userId: reservation.userId,
    bookId: reservation.bookId,
    status: statusMap[reservation.status],
    createdAt: reservation.createdAt,
    expiresAt: reservation.pickupExpiresAt ?? undefined,
  }
}
