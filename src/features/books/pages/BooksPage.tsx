const books = [
  { id: 1, title: 'El Quijote', author: 'Miguel de Cervantes', category: 'Clásico', available: true },
  { id: 2, title: 'Cien años de soledad', author: 'Gabriel García Márquez', category: 'Literatura', available: false },
  { id: 3, title: 'La Metamorfosis', author: 'Franz Kafka', category: 'Ficción', available: true },
]

export function BooksPage() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Libros</h1>
        </div>
        <button className="primary-button">Nuevo libro</button>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th>Disponibilidad</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>
                  <span className={book.available ? 'status ok' : 'status warning'}>
                    {book.available ? 'Disponible' : 'Prestado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
