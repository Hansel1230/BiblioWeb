import { apiPost } from '../../../lib/api/client'
import { endpoints } from '../../../lib/api/endpoints'
import type { CreateReservationInput, Reservation } from '../../../types'

export function createReservation(input: CreateReservationInput): Promise<Reservation> {
  return apiPost<Reservation, CreateReservationInput>(endpoints.reservations, input)
}
