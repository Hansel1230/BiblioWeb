const users = [
  { id: 1, name: 'Elena Díaz', email: 'elena@biblio.com', role: 'bibliotecario', active: true },
  { id: 2, name: 'Pedro Ruiz', email: 'pedro@biblio.com', role: 'lector', active: true },
  { id: 3, name: 'Ana García', email: 'ana@biblio.com', role: 'admin', active: false },
]

export function UsersPage() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h1>Gestión de usuarios</h1>
        </div>
        <button className="primary-button">Nuevo usuario</button>
      </div>

      <div className="table-panel">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={user.active ? 'status ok' : 'status warning'}>
                    {user.active ? 'Activo' : 'Inactivo'}
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
