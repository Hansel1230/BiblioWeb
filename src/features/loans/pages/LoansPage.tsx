import type { Loan, UserRole } from '../../../types'

const CURRENT_USER_KEY = 'biblioweb-current-user'

type CurrentUserSession = {
  email: string
  name: string
  role: UserRole
}

function getCurrentUser(): CurrentUserSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const currentUser = window.localStorage.getItem(CURRENT_USER_KEY)
    return currentUser ? (JSON.parse(currentUser) as CurrentUserSession) : null
  } catch (error) {
    console.error('Error al leer el usuario actual:', error)
    return null
  }
}

const loans: Loan[] = [
  { id: 1, userName: 'Elena Díaz', userEmail: 'admin@biblio.com', bookTitle: 'El Quijote', dueDate: '2026-10-12', status: 'Activo' },
  { id: 2, userName: 'Pedro Ruiz', userEmail: 'lector@biblio.com', bookTitle: 'La Metamorfosis', dueDate: '2026-10-09', status: 'Vencido' },
  { id: 3, userName: 'María López', userEmail: 'maria@biblio.com', bookTitle: 'Cien años de soledad', dueDate: '2026-10-15', status: 'Devuelto' },
] as const

export function LoansPage() {
  const currentUser = getCurrentUser()
  const isReader = currentUser?.role === 'lector'
  const visibleLoans =
    isReader && currentUser
      ? loans.filter((loan) => loan.userEmail.toLowerCase() === currentUser.email.toLowerCase())
      : (loans as Loan[])

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1>Préstamos</h1>
        </div>
        {!isReader && <button className="primary-button">Nuevo préstamo</button>}
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Libro</th>
              <th>Fecha límite</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibleLoans.length === 0 ? (
              <tr>
                <td colSpan={4}>{isReader ? 'No tienes préstamos asignados.' : 'No hay préstamos registrados.'}</td>
              </tr>
            ) : (
              visibleLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.userName}</td>
                  <td>{loan.bookTitle}</td>
                  <td>{loan.dueDate}</td>
                  <td>
                    <span
                      className={
                        loan.status === 'Activo'
                          ? 'status ok'
                          : loan.status === 'Vencido'
                            ? 'status warning'
                            : 'status info'
                      }
                    >
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
