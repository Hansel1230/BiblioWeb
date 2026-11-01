import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import type { UserRole } from '../../../types'
import { useUsers } from '../hooks/useUsers'
import { UserTable } from '../components/UserTable'

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  lector: 'Lector',
}

export function UsersPage() {
  const { data: users = [], isLoading, isError, refetch } = useUsers()

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h1>Gestión de usuarios</h1>
          <p>Usuarios cargados desde la API.</p>
        </div>
      </div>

      {isLoading && <LoadingState message="Cargando usuarios desde la API…" />}
      {isError && <ErrorState message="No se pudieron cargar los usuarios desde la API." onRetry={() => void refetch()} />}
      {!isLoading && !isError && (
        <UserTable
          users={users}
          roleLabels={roleLabels}
        />
      )}
    </section>
  )
}
