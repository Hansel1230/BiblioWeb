import { getCurrentUser } from '../../../lib/auth/session'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import { useBooks } from '../hooks/useBooks'
import { BookTable } from '../components/BookTable'

export function BooksPage() {
  const currentUser = getCurrentUser()
  const { data: books = [], isLoading, isError, refetch } = useBooks()
  const isReader = currentUser?.role === 'lector'

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Libros</h1>
          <p>Libros cargados desde la API.</p>
        </div>
      </div>

      {isLoading && <LoadingState message="Cargando libros desde la API…" />}
      {isError && <ErrorState message="No se pudieron cargar los libros desde la API." onRetry={() => void refetch()} />}
      {!isLoading && !isError && <BookTable books={books} isReader={isReader} />}
    </section>
  )
}
