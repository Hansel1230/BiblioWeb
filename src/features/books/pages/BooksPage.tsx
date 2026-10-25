import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { Book } from '../../../types'
import { getCurrentUser } from '../../../lib/auth/session'

const STORAGE_KEY = 'biblioweb-books'
const defaultBooks: Book[] = [
  { id: 1, title: 'El Quijote', author: 'Miguel de Cervantes', category: 'Clásico', available: true },
  { id: 2, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Literatura', available: false },
  { id: 3, title: 'La Metamorfosis', author: 'Franz Kafka', category: 'Ficción', available: true },
]

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
    return defaultBooks
  }

  try {
    const savedBooks = window.localStorage.getItem(STORAGE_KEY)

    if (!savedBooks) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBooks))
      return defaultBooks
    }

    const parsedBooks = JSON.parse(savedBooks) as Book[]

    if (Array.isArray(parsedBooks)) {
      return parsedBooks
    }

    return []
  } catch (error) {
    console.error('Error al leer libros guardados:', error)
    return defaultBooks
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

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th>Disponibilidad</th>
              {!isReader && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={5}>No hay libros registrados.</td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>
                    <span className={book.available ? 'status ok' : 'status warning'}>
                      {book.available ? 'Disponible' : 'Prestado'}
                    </span>
                  </td>
                  {!isReader && (
                    <td>
                      <div className="table-actions">
                        <button type="button" className="table-button secondary-button" onClick={() => openEditForm(book)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="table-button danger-button"
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
