import { useState, type FormEvent } from 'react'
import type { Loan } from '../../../types'
import { getCurrentUser } from '../../../lib/auth/session'
import { useCreateLoan, useLoans } from '../hooks/useLoans'

export function LoansPage() {
  const currentUser = getCurrentUser()
  const isReader = currentUser?.role === 'lector'
  const { data: loans = [], isLoading, isError } = useLoans()
  const createLoanMutation = useCreateLoan()
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState('')
  const [bookId, setBookId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const visibleLoans = isReader && currentUser
    ? loans.filter((loan) => loan.userEmail.toLowerCase() === currentUser.email.toLowerCase())
    : loans

  const handleCreateLoan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createLoanMutation.mutate(
      { userId: Number(userId), bookId: Number(bookId), dueDate },
      {
        onSuccess: () => {
          setUserId('')
          setBookId('')
          setDueDate('')
          setShowForm(false)
        },
      },
    )
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1>Préstamos</h1>
        </div>
        {!isReader && (
          <button type="button" className="primary-button" onClick={() => setShowForm((visible) => !visible)}>
            Nuevo préstamo
          </button>
        )}
      </div>

      {showForm && !isReader && (
        <form className="form-panel" onSubmit={handleCreateLoan}>
          <h2>Registrar préstamo</h2>
          <label className="field">
            <span>ID del usuario</span>
            <input type="number" min="1" value={userId} onChange={(event) => setUserId(event.target.value)} required />
          </label>
          <label className="field">
            <span>ID del libro</span>
            <input type="number" min="1" value={bookId} onChange={(event) => setBookId(event.target.value)} required />
          </label>
          <label className="field">
            <span>Fecha límite</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
          </label>
          {createLoanMutation.isError && <p className="error-text">No se pudo registrar el préstamo.</p>}
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cerrar</button>
            <button type="submit" className="primary-button" disabled={createLoanMutation.isPending}>
              {createLoanMutation.isPending ? 'Guardando…' : 'Guardar préstamo'}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p>Cargando préstamos…</p>}
      {isError && <p className="error-text">No se pudieron cargar los préstamos.</p>}

      {!isLoading && !isError && (
        <div className="table-panel">
          <table>
            <thead>
              <tr><th>Usuario</th><th>Libro</th><th>Fecha límite</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {visibleLoans.length === 0 ? (
                <tr><td colSpan={4}>{isReader ? 'No tienes préstamos asignados.' : 'No hay préstamos registrados.'}</td></tr>
              ) : visibleLoans.map((loan: Loan) => (
                <tr key={loan.id}>
                  <td>{loan.userName}</td>
                  <td>{loan.bookTitle}</td>
                  <td>{loan.dueDate}</td>
                  <td>
                    <span className={loan.status === 'Activo' ? 'status ok' : loan.status === 'Vencido' ? 'status warning' : 'status info'}>
                      {loan.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
