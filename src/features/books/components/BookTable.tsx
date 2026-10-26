import type { Book } from '../../../types'

type BookTableProps = {
  books: Book[]
  isReader: boolean
  onEdit?: (book: Book) => void
  onDelete?: (id: number) => void
}

export function BookTable({ books, isReader, onEdit, onDelete }: BookTableProps) {
  return <div className="table-panel"><table><caption>Libros registrados</caption><thead><tr><th scope="col">Título</th><th scope="col">Autor</th><th scope="col">Categoría</th><th scope="col">Disponibilidad</th>{!isReader && <th scope="col">Acciones</th>}</tr></thead><tbody>
    {books.length === 0 ? <tr><td colSpan={isReader ? 4 : 5}>No hay libros registrados.</td></tr> : books.map((book) => <tr key={book.id}><td>{book.title}</td><td>{book.author}</td><td>{book.category}</td><td><span className={book.available ? 'status ok' : 'status warning'}>{book.available ? 'Disponible' : 'Prestado'}</span></td>{!isReader && <td><div className="table-actions"><button type="button" className="table-button secondary-button" onClick={() => onEdit?.(book)}>Editar</button><button type="button" className="table-button danger-button" onClick={() => onDelete?.(book.id)}>Eliminar</button></div></td>}</tr>)}
  </tbody></table></div>
}
