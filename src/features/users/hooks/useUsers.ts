import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, deleteUser, getUsers, updateUser, updateUserStatus } from '../services/users-service'
import type { BackendUserStatus, CreateUserInput, UpdateUserInput } from '../../../types'

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: getUsers })
}

function invalidateUsers(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['users'] })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: (input: CreateUserInput) => createUser(input), onSuccess: () => invalidateUsers(queryClient) })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => invalidateUsers(queryClient),
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: BackendUserStatus }) => updateUserStatus(id, estado),
    onSuccess: () => invalidateUsers(queryClient),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: deleteUser, onSuccess: () => invalidateUsers(queryClient) })
}
