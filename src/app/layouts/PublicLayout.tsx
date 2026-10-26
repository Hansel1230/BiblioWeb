import { NavLink, Outlet } from 'react-router-dom'
import { getCurrentUser } from '../../lib/auth/session'

export function PublicLayout() {
  const currentUser = getCurrentUser()

  return (
    <div className="public-shell">
      <header className="public-header">
        <NavLink to="/catalog" className="brand-link"><strong>BiblioWeb</strong></NavLink>
        <nav className="public-nav" aria-label="Navegación pública">
          <NavLink to="/catalog">Catálogo</NavLink>
          {currentUser ? (
            <NavLink to="/dashboard">Mi panel</NavLink>
          ) : (
            <>
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink to="/register">Registrarme</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="public-content"><Outlet /></main>
    </div>
  )
}
