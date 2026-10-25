import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createReservation } from '../services/reservations-service'
import type { CreateReservationInput } from '../../../types'

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReservationInput) => createReservation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
