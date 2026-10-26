import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Book } from '../../../types'
import { getCurrentUser } from '../../../lib/auth/session'
import { MOCK_KEYS, defaultMockBooks } from '../../../mocks/data'
import { BookTable } from '../components/BookTable'

const STORAGE_KEY = MOCK_KEYS.books

type BookFormData = {
  title: string
  author: string
  category: string
  available: boolean
}

const emptyForm: BookFormData = {
  title: '',
  author: '',
  category: '',
  available: true,
}

function readBooksFromStorage(): Book[] {
  if (typeof window === 'undefined') {
    return defaultMockBooks
  }

  try {
    const savedBooks = window.localStorage.getItem(STORAGE_KEY)

    if (!savedBooks) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMockBooks))
      return defaultMockBooks
    }

    const parsedBooks = JSON.parse(savedBooks) as Book[]

    if (Array.isArray(parsedBooks)) {
      return parsedBooks
    }

    return []
  } catch (error) {
    console.error('Error al leer libros guardados:', error)
    return defaultMockBooks
  }
}

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>(() => readBooksFromStorage())
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<BookFormData>(emptyForm)
  const currentUser = getCurrentUser()
  const isReader = currentUser?.role === 'lector'

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  }, [books])

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
    setError('')
  }

  const openCreateForm = () => {
    if (isReader) {
      return
    }

    setEditingId(null)
    setFormData(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (book: Book) => {
    if (isReader) {
      return
    }

    setEditingId(book.id)
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      available: book.available,
    })
    setError('')
    setShowForm(true)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = event.target

    if (type === 'checkbox') {
      setFormData((currentForm) => ({ ...currentForm, available: checked }))
      return
    }

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = formData.title.trim()
    const author = formData.author.trim()
    const category = formData.category.trim()

    if (!title || !author || !category) {
      setError('Completa título, autor y categoría.')
      return
    }

    if (editingId !== null) {
      setBooks((currentBooks) =>
        currentBooks.map((book) =>
          book.id === editingId
            ? {
                ...book,
                title,
                author,
                category,
                available: formData.available,
              }
            : book,
        ),
      )
    } else {
      const newBook: Book = {
        id: Date.now(),
        title,
        author,
        category,
        available: formData.available,
      }

      setBooks((currentBooks) => [newBook, ...currentBooks])
    }

    resetForm()
  }

  const handleDeleteBook = (bookId: number) => {
    if (isReader) {
      return
    }

    const bookToDelete = books.find((book) => book.id === bookId)

    if (!bookToDelete) {
      return
    }

    const confirmed = window.confirm(`¿Deseas eliminar el libro "${bookToDelete.title}"?`)

    if (!confirmed) {
      return
    }

    setBooks((currentBooks) => currentBooks.filter((book) => book.id !== bookId))
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Libros</h1>
        </div>
        {!isReader && (
          <button type="button" className="primary-button" onClick={openCreateForm}>
            Nuevo libro
          </button>
        )}
      </div>

      {showForm && !isReader && (
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? 'Editar libro' : 'Registrar nuevo libro'}</h2>

          <div className="form-grid">
            <label className="field">
              <span>Título</span>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej. El principito"
              />
            </label>

            <label className="field">
              <span>Autor</span>
              <input
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Ej. Antoine de Saint-Exupéry"
              />
            </label>

            <label className="field">
              <span>Categoría</span>
              <input
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ej. Infantil"
              />
            </label>

            <label className="field">
              <span>Disponibilidad</span>
              <div className="switch-row">
                <span>{formData.available ? 'Disponible' : 'Prestado'}</span>
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                />
              </div>
            </label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cerrar
            </button>
            <button type="submit" className="primary-button">
              {editingId !== null ? 'Actualizar libro' : 'Guardar libro'}
            </button>
          </div>
        </form>
      )}

      <BookTable books={books} isReader={isReader} onEdit={openEditForm} onDelete={handleDeleteBook} />
    </section>
  )
}
