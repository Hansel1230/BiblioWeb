import { getCurrentUser } from '../../../lib/auth/session'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'
import { ApiError } from '../../../lib/api/client'
import { useCategories, useCreateBook, useBooks, useDeleteBook, useUpdateBook } from '../hooks/useBooks'
import { BookTable } from '../components/BookTable'
import { BookForm } from '../components/BookForm'
import type { Book, CreateBookInput } from '../../../types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function getMutationError(error: unknown) {
  if (error instanceof ApiError) {
    return [error.message, ...(error.details ?? [])].join(' ')
  }
  return error instanceof Error ? error.message : 'No se pudo completar la operación.'
}

export function BooksPage() {
  const currentUser = getCurrentUser()
  const navigate = useNavigate()
  const { data: books = [], isLoading, isError, refetch } = useBooks()
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useCategories()
  const createMutation = useCreateBook()
  const updateMutation = useUpdateBook()
  const deleteMutation = useDeleteBook()
  const [editingBook, setEditingBook] = useState<Book>()
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const mutation = editingBook ? updateMutation : createMutation

  function closeForm() {
    setShowForm(false)
    setEditingBook(undefined)
  }

  function saveBook(input: CreateBookInput) {
    setSuccessMessage('')
    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, input }, {
        onSuccess: () => { setSuccessMessage('Libro actualizado correctamente.'); closeForm() },
      })
    } else {
      createMutation.mutate(input, {
        onSuccess: () => { setSuccessMessage('Libro creado correctamente.'); closeForm() },
      })
    }
  }

  function removeBook(id: number) {
    if (!window.confirm('¿Deseas eliminar este libro? La eliminación será una baja lógica en la API.')) return
    setSuccessMessage('')
    deleteMutation.mutate(id, { onSuccess: () => setSuccessMessage('Libro eliminado correctamente.') })
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Libros</h1>
          <p>Administra los libros registrados en la biblioteca.</p>
        </div>
        {currentUser?.role === 'admin' && !showForm && <button type="button" className="primary-button" onClick={() => { setSuccessMessage(''); setShowForm(true) }}>Nuevo libro</button>}
      </div>

      {showForm && <BookForm book={editingBook} categories={categories} categoriesLoading={categoriesLoading} categoriesError={categoriesError} isPending={mutation.isPending} onSubmit={saveBook} onCancel={closeForm} />}
      {showForm && categoriesError && <ErrorState message="No se pudieron cargar las categorías. No es posible guardar el libro." />}
      {successMessage && <SuccessMessage message={successMessage} />}
      {createMutation.isError && <ErrorState message={getMutationError(createMutation.error)} />}
      {updateMutation.isError && <ErrorState message={getMutationError(updateMutation.error)} />}
      {deleteMutation.isError && <ErrorState message={getMutationError(deleteMutation.error)} />}
      {isLoading && <LoadingState message="Cargando libros desde la API…" />}
      {isError && <ErrorState message="No se pudieron cargar los libros desde la API." onRetry={() => void refetch()} />}
      {!isLoading && !isError && <BookTable books={books} isReader={currentUser?.role !== 'admin'} onCopies={(book) => navigate(`/books/${book.id}/copies`)} onEdit={(book) => { setEditingBook(book); setShowForm(true) }} onDelete={removeBook} />}
    </section>
  )
}
