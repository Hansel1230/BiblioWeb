import { useCreateReservation } from '../../reservations/hooks/useReservations'
import { getCurrentUser } from '../../../lib/auth/session'
import { useBooks } from '../hooks/useBooks'

export function CatalogPage() {
  const currentUser = getCurrentUser()
  const { data: books = [], isLoading, isError } = useBooks()
  const reservationMutation = useCreateReservation()

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo público</p>
          <h1>Libros disponibles</h1>
          <p>Consulta el catálogo sin iniciar sesión.</p>
        </div>
      </div>

      {isLoading && <p>Cargando catálogo…</p>}
      {isError && <p className="error-text">No se pudo cargar el catálogo.</p>}

      {!isLoading && !isError && books.length === 0 && <p>No hay libros registrados.</p>}

      {!isLoading && !isError && books.length > 0 && (
        <div className="table-panel">
          <table>
            <caption>Catálogo de libros de BiblioWeb</caption>
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Autor</th>
                <th scope="col">Categoría</th>
                <th scope="col">ISBN</th>
                <th scope="col">Disponibilidad</th>
                {currentUser?.role === 'lector' && <th scope="col">Acción</th>}
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{book.isbn ?? 'No registrado'}</td>
                  <td>{book.available ? 'Disponible' : 'No disponible'}</td>
                  {currentUser?.role === 'lector' && (
                    <td>
                      <button
                        type="button"
                        className="table-button secondary-button"
                        disabled={!book.available || reservationMutation.isPending}
                        onClick={() => reservationMutation.mutate({ bookId: book.id })}
                      >
                        {reservationMutation.isPending ? 'Procesando…' : 'Reservar'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {reservationMutation.isError && (
            <p className="error-text">No se pudo crear la reserva. Intenta nuevamente.</p>
          )}
          {reservationMutation.isSuccess && <p>Reserva enviada correctamente.</p>}
        </div>
      )}
    </section>
  )
}
