import { useMemo, useState, type FormEvent } from 'react'
import type { Loan } from '../../../types'
import { getCurrentUser } from '../../../lib/auth/session'
import { useCreateLoan, useLoans, useRenewLoan, useReturnLoan } from '../hooks/useLoans'
import { useUsers } from '../../users/hooks/useUsers'
import { useBooks } from '../../books/hooks/useBooks'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'

export function LoansPage() {
  const currentUser = getCurrentUser()
  const isReader = currentUser?.role === 'lector'
  const { data: loans = [], isLoading, isError } = useLoans()
  const { data: users = [] } = useUsers()
  const { data: books = [] } = useBooks()
  const createLoanMutation = useCreateLoan()
  const returnMutation = useReturnLoan()
  const renewMutation = useRenewLoan()
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState('')
  const [bookId, setBookId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [success, setSuccess] = useState('')
  const visibleLoans = isReader && currentUser
    ? loans.filter((loan) => loan.userEmail.toLowerCase() === currentUser.email.toLowerCase())
    : loans
  const filteredLoans = useMemo(() => visibleLoans.filter((loan) => {
    const query = search.toLowerCase()
    return (!query || `${loan.userName} ${loan.bookTitle}`.toLowerCase().includes(query)) && (!status || loan.status === status)
  }), [search, status, visibleLoans])

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
          setSuccess('Préstamo registrado correctamente.')
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

      {success && <SuccessMessage message={success} />}
      {showForm && !isReader && (
        <form className="form-panel" onSubmit={handleCreateLoan}>
          <h2>Registrar préstamo</h2>
          <label className="field"><span>Usuario</span><select value={userId} onChange={(event) => setUserId(event.target.value)} required><option value="">Selecciona un usuario</option>{users.filter((user) => user.active).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
          <label className="field"><span>Libro disponible</span><select value={bookId} onChange={(event) => setBookId(event.target.value)} required><option value="">Selecciona un libro</option>{books.filter((book) => book.available).map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}</select></label>
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

      {!isLoading && !isError && <div className="filter-bar"><label htmlFor="loan-search">Buscar</label><input id="loan-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Usuario o libro" /><label htmlFor="loan-status">Estado</label><select id="loan-status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos</option><option>Activo</option><option>Vencido</option><option>Devuelto</option></select></div>}
      {isLoading && <LoadingState message="Cargando préstamos…" />}
      {isError && <ErrorState message="No se pudieron cargar los préstamos." />}

      {!isLoading && !isError && (
        <div className="table-panel">
          <table>
            <thead>
              <tr><th scope="col">Usuario</th><th scope="col">Libro</th><th scope="col">Fecha límite</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message={isReader ? 'No tienes préstamos asignados.' : 'No hay préstamos registrados.'} /></td></tr>
              ) : filteredLoans.map((loan: Loan) => (
                <tr key={loan.id}>
                  <td>{loan.userName}</td>
                  <td>{loan.bookTitle}</td>
                  <td>{loan.dueDate}</td>
                  <td>
                    <span className={loan.status === 'Activo' ? 'status ok' : loan.status === 'Vencido' ? 'status warning' : 'status info'}>
                      {loan.status}
                    </span>
                  </td>
                  <td><div className="table-actions">{loan.status !== 'Devuelto' && <button type="button" className="table-button secondary-button" onClick={() => { if (window.confirm('¿Registrar devolución?')) { returnMutation.mutate(loan.id); setSuccess('Devolución registrada.') } }}>Devolver</button>}{loan.status === 'Activo' && <button type="button" className="table-button secondary-button" onClick={() => { renewMutation.mutate(loan.id); setSuccess('Préstamo renovado.') }}>Renovar</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
