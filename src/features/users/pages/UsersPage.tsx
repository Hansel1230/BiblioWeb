import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { UserRole } from '../../../types'
import { useUsers } from '../hooks/useUsers'
import { UserTable } from '../components/UserTable'
import { UserForm } from '../components/UserForm'
import { ApiError } from '../../../lib/api/client'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'
import { useCreateUser, useDeleteUser, useUpdateUser, useUpdateUserStatus } from '../hooks/useUsers'
import type { BackendUserStatus, CreateUserInput, UpdateUserInput, User } from '../../../types'
import { useState } from 'react'

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  lector: 'Lector',
}

export function UsersPage() {
  const { data: users = [], isLoading, isError, refetch } = useUsers()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const statusMutation = useUpdateUserStatus()
  const deleteMutation = useDeleteUser()
  const [editingUser, setEditingUser] = useState<User>()
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const mutation = editingUser ? updateMutation : createMutation

  function closeForm() { setShowForm(false); setEditingUser(undefined) }
  function saveUser(input: CreateUserInput | UpdateUserInput) {
    setSuccessMessage('')
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, input }, { onSuccess: () => { setSuccessMessage('Usuario actualizado correctamente.'); closeForm() } })
    } else {
      createMutation.mutate(input as CreateUserInput, { onSuccess: () => { setSuccessMessage('Usuario creado correctamente.'); closeForm() } })
    }
  }
  function toggleStatus(user: User) {
    const estado: BackendUserStatus = user.status === 'Blocked' ? 'Active' : 'Blocked'
    statusMutation.mutate({ id: user.id, estado }, { onSuccess: () => setSuccessMessage('Estado del usuario actualizado.') })
  }
  function removeUser(id: number) {
    if (!window.confirm('¿Deseas desactivar este usuario? La eliminación será una baja lógica.')) return
    deleteMutation.mutate(id, { onSuccess: () => setSuccessMessage('Usuario desactivado correctamente.') })
  }
  const mutationError = createMutation.error ?? updateMutation.error ?? statusMutation.error ?? deleteMutation.error
  const errorMessage = mutationError instanceof ApiError ? [mutationError.message, ...(mutationError.details ?? [])].join(' ') : mutationError instanceof Error ? mutationError.message : 'No se pudo completar la operación.'

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h1>Gestión de usuarios</h1>
          <p>Administra usuarios, roles y estados de acceso.</p>
        </div>
        {!showForm && <button type="button" className="primary-button" onClick={() => { setSuccessMessage(''); setShowForm(true) }}>Nuevo usuario</button>}
      </div>

      {showForm && <UserForm user={editingUser} isPending={mutation.isPending} onSubmit={saveUser} onCancel={closeForm} />}
      {mutationError && <ErrorState message={errorMessage} />}
      {successMessage && <SuccessMessage message={successMessage} />}
      {isLoading && <LoadingState message="Cargando usuarios desde la API…" />}
      {isError && <ErrorState message="No se pudieron cargar los usuarios desde la API." onRetry={() => void refetch()} />}
      {!isLoading && !isError && (
        <UserTable
          users={users}
          roleLabels={roleLabels}
          onEdit={(user) => { setEditingUser(user); setShowForm(true) }}
          onStatusChange={toggleStatus}
          onDelete={removeUser}
        />
      )}
    </section>
  )
}
