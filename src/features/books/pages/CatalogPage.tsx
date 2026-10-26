import { useCreateReservation, useReservations } from '../../reservations/hooks/useReservations'
import { getCurrentUser } from '../../../lib/auth/session'
import { useBooks } from '../hooks/useBooks'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'

export function CatalogPage() {
  const currentUser = getCurrentUser()
  const { data: books = [], isLoading, isError } = useBooks()
  const reservationMutation = useCreateReservation()
  const reservationsQuery = useReservations()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [availability, setAvailability] = useState('')
  const [reservedBookIds, setReservedBookIds] = useState<number[]>([])
  const persistedReservedBookIds = reservationsQuery.data?.filter((item) => ['pending', 'approved'].includes(item.status)).map((item) => item.bookId) ?? reservedBookIds
  const categories = [...new Set(books.map((book) => book.category))]
  const filteredBooks = useMemo(() => books.filter((book) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [book.title, book.author, book.category, book.isbn ?? ''].some((value) => value.toLowerCase().includes(query))
    return matchesSearch && (!category || book.category === category) && (!availability || (availability === 'available' ? book.available : !book.available))
  }), [availability, books, category, search])

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo público</p>
          <h1>Libros disponibles</h1>
          <p>Consulta el catálogo sin iniciar sesión.</p>
        </div>
      </div>

      {isLoading && <LoadingState message="Cargando catálogo…" />}
      {isError && <ErrorState message="No se pudo cargar el catálogo." />}

      {!isLoading && !isError && <div className="filter-bar" aria-label="Filtros del catálogo">
        <label htmlFor="catalog-search">Buscar</label>
        <input id="catalog-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, autor o ISBN" />
        <label htmlFor="catalog-category">Categoría</label>
        <select id="catalog-category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Todas</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label htmlFor="catalog-availability">Disponibilidad</label>
        <select id="catalog-availability" value={availability} onChange={(event) => setAvailability(event.target.value)}>
          <option value="">Todas</option><option value="available">Disponible</option><option value="unavailable">No disponible</option>
        </select>
        <button type="button" className="secondary-button" onClick={() => { setSearch(''); setCategory(''); setAvailability('') }}>Limpiar filtros</button>
      </div>}

      {!isLoading && !isError && books.length === 0 && <EmptyState message="No hay libros registrados." />}
      {!isLoading && !isError && books.length > 0 && filteredBooks.length === 0 && <EmptyState message="No se encontraron libros con esos filtros." />}

      {!isLoading && !isError && filteredBooks.length > 0 && (
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
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{book.isbn ?? 'No registrado'}</td>
                  <td>{book.available ? 'Disponible' : 'No disponible'}</td>
                  {currentUser?.role === 'lector' && (
                    <td>
                      {persistedReservedBookIds.includes(book.id) ? <span className="status info">Ya reservado</span> : (
                      <button
                        type="button"
                        className="table-button secondary-button"
                        disabled={!book.available || reservationMutation.isPending}
                        onClick={() => {
                          if (window.confirm(`¿Deseas reservar "${book.title}"?`)) {
                            reservationMutation.mutate({ bookId: book.id }, { onSuccess: () => setReservedBookIds((ids) => [...ids, book.id]) })
                          }
                        }}
                      >
                        {reservationMutation.isPending ? 'Procesando…' : 'Reservar'}
                      </button>)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {reservationMutation.isError && <ErrorState message="No se pudo crear la reserva. Intenta nuevamente." />}
          {reservationMutation.isSuccess && <SuccessMessage message="Reserva enviada correctamente." />}
        </div>
      )}
    </section>
  )
}
import { useMemo, useState } from 'react'
