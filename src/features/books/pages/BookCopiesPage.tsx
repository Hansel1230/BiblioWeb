import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ApiError } from '../../../lib/api/client'
import { ErrorState } from '../../../components/ui/ErrorState'
import { LoadingState } from '../../../components/ui/LoadingState'
import { SuccessMessage } from '../../../components/ui/SuccessMessage'
import { useBooks } from '../hooks/useBooks'
import { useBookCopies, useCreateBookCopy, useDeleteBookCopy, useUpdateBookCopyStatus } from '../hooks/useBookCopies'
import { BookCopyForm } from '../components/BookCopyForm'
import { BookCopyTable } from '../components/BookCopyTable'
import type { CopyStatus, CreateBookCopyInput } from '../../../types'

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return [error.message, ...(error.details ?? [])].join(' ')
  return error instanceof Error ? error.message : 'No se pudo completar la operación.'
}

export function BookCopiesPage() {
  const bookId = Number(useParams().bookId)
  const { data: books = [] } = useBooks()
  const book = books.find((item) => item.id === bookId)
  const { data: copies = [], isLoading, isError, refetch } = useBookCopies(bookId)
  const createMutation = useCreateBookCopy(bookId)
  const statusMutation = useUpdateBookCopyStatus(bookId)
  const deleteMutation = useDeleteBookCopy(bookId)
  const [successMessage, setSuccessMessage] = useState('')

  function createCopy(input: CreateBookCopyInput) {
    setSuccessMessage('')
    createMutation.mutate(input, { onSuccess: () => setSuccessMessage('Ejemplar agregado correctamente.') })
  }

  function changeStatus(id: number, status: CopyStatus) {
    setSuccessMessage('')
    statusMutation.mutate({ id, status }, { onSuccess: () => setSuccessMessage('Estado del ejemplar actualizado.') })
  }

  function retireCopy(id: number) {
    if (!window.confirm('¿Deseas retirar este ejemplar? Esta acción lo marcará como retirado.')) return
    setSuccessMessage('')
    deleteMutation.mutate(id, { onSuccess: () => setSuccessMessage('Ejemplar retirado correctamente.') })
  }

  const mutationError = createMutation.error ?? statusMutation.error ?? deleteMutation.error
  const isPending = createMutation.isPending || statusMutation.isPending || deleteMutation.isPending

  if (!Number.isInteger(bookId) || bookId <= 0) return <ErrorState message="El libro solicitado no es válido." />

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Inventario</p>
          <h1>Ejemplares{book ? `: ${book.title}` : ''}</h1>
          <p>Administra las copias físicas y su estado.</p>
        </div>
        <Link className="secondary-button" to="/books">Volver a libros</Link>
      </div>
      <BookCopyForm isPending={isPending} onSubmit={createCopy} />
      {successMessage && <SuccessMessage message={successMessage} />}
      {mutationError && <ErrorState message={errorMessage(mutationError)} />}
      {isLoading && <LoadingState message="Cargando ejemplares…" />}
      {isError && <ErrorState message="No se pudieron cargar los ejemplares." onRetry={() => void refetch()} />}
      {!isLoading && !isError && <BookCopyTable copies={copies} isPending={isPending} onStatusChange={changeStatus} onDelete={retireCopy} />}
    </section>
  )
}
