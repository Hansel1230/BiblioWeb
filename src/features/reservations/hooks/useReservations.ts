import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelReservation, createReservation, getReservations } from '../services/reservations-service'
import type { CreateReservationInput } from '../../../types'

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReservationInput) => createReservation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}

export function useReservations() {
  return useQuery({ queryKey: ['reservations'], queryFn: getReservations })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
