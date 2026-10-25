import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLoan, getLoans } from '../services/loans-service'
import type { CreateLoanInput } from '../../../types'

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLoanInput) => createLoan(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['loans'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
