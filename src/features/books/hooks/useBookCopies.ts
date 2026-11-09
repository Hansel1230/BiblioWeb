import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBookCopy, deleteBookCopy, getBookCopies, updateBookCopyStatus } from '../services/copies-service'
import type { BookCopy, CopyStatus, CreateBookCopyInput } from '../../../types'

export function useBookCopies(bookId: number) {
  return useQuery({
    queryKey: ['book-copies', bookId],
    queryFn: () => getBookCopies(bookId),
    enabled: Number.isInteger(bookId) && bookId > 0,
  })
}

export function useCreateBookCopy(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBookCopyInput) => createBookCopy(bookId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useUpdateBookCopyStatus(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: CopyStatus }) => updateBookCopyStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}

export function useDeleteBookCopy(bookId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBookCopy,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<BookCopy[]>(['book-copies', bookId], (copies = []) => copies.map((copy) => copy.id === id ? { ...copy, status: 'retired' } : copy))
      void queryClient.invalidateQueries({ queryKey: ['book-copies', bookId] })
      void queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
