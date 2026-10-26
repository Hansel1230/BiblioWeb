import { useBooks } from '../../books/hooks/useBooks'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'
import { useCancelReservation, useReservations } from '../hooks/useReservations'

export function ReservationsPage() {
  const reservationsQuery = useReservations()
  const booksQuery = useBooks()
  const cancelMutation = useCancelReservation()

  if (reservationsQuery.isLoading || booksQuery.isLoading) return <section className="page-shell"><LoadingState message="Cargando reservas…" /></section>
  if (reservationsQuery.isError || booksQuery.isError) return <section className="page-shell"><ErrorState message="No se pudieron cargar las reservas." onRetry={() => void reservationsQuery.refetch()} /></section>

  const reservations = reservationsQuery.data ?? []
  const books = booksQuery.data ?? []

  return (
    <section className="page-shell">
      <div className="page-header"><div><p className="eyebrow">Mi biblioteca</p><h1>Mis reservas</h1></div></div>
      {cancelMutation.isSuccess && <SuccessMessage message="Reserva cancelada correctamente." />}
      {cancelMutation.isError && <ErrorState message="No se pudo cancelar la reserva." />}
      {reservations.length === 0 ? <EmptyState message="No tienes reservas registradas." /> : (
        <div className="table-panel">
          <table>
            <caption>Reservas del usuario</caption>
            <thead><tr><th scope="col">Libro</th><th scope="col">Fecha</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{reservations.map((reservation) => {
              const book = books.find((item) => item.id === reservation.bookId)
              const canCancel = reservation.status === 'pending' || reservation.status === 'approved'
              return <tr key={reservation.id}>
                <td>{book?.title ?? `Libro #${reservation.bookId}`}</td>
                <td>{new Date(reservation.createdAt).toLocaleDateString('es-DO')}</td>
                <td>{reservation.status}</td>
                <td>{canCancel && <button type="button" className="table-button danger-button" onClick={() => {
                  if (window.confirm('¿Deseas cancelar esta reserva?')) cancelMutation.mutate(reservation.id)
                }}>Cancelar</button>}</td>
              </tr>
            })}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}
