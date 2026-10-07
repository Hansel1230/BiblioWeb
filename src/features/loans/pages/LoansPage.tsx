const loans = [
  { id: 1, userName: 'Elena Díaz', bookTitle: 'El Quijote', dueDate: '2026-10-12', status: 'Activo' },
  { id: 2, userName: 'Pedro Ruiz', bookTitle: 'La Metamorfosis', dueDate: '2026-10-09', status: 'Vencido' },
  { id: 3, userName: 'María López', bookTitle: 'Cien años de soledad', dueDate: '2026-10-15', status: 'Devuelto' },
] as const

export function LoansPage() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1>Préstamos</h1>
        </div>
        <button className="primary-button">Nuevo préstamo</button>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Libro</th>
              <th>Fecha límite</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.userName}</td>
                <td>{loan.bookTitle}</td>
                <td>{loan.dueDate}</td>
                <td>
                  <span
                    className={
                      loan.status === 'Activo'
                        ? 'status ok'
                        : loan.status === 'Vencido'
                          ? 'status warning'
                          : 'status info'
                    }
                  >
                    {loan.status}
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
