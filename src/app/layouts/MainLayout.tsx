import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/books', label: 'Libros' },
  { to: '/users', label: 'Usuarios' },
  { to: '/loans', label: 'Préstamos' },
]

export function MainLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">B</span>
          <div>
            <strong>BiblioWeb</strong>
            <small>Biblioteca</small>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  )
}
