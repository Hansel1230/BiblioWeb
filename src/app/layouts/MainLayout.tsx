import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearCurrentUser, getCurrentUser } from '../../lib/auth/session'

const navigation = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/books', label: 'Libros' },
  { to: '/users', label: 'Usuarios' },
  { to: '/loans', label: 'Préstamos' },
  { to: '/reservations', label: 'Mis reservas' },
]

export function MainLayout() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  const handleLogout = () => {
    clearCurrentUser()
    navigate('/login', { replace: true })
  }

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
          {navigation
            .filter((item) => (item.to !== '/users' || isAdmin) && (item.to !== '/reservations' || currentUser?.role === 'lector'))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <button type="button" className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  )
}
