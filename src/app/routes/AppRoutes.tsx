import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { CatalogPage } from '../../features/books/pages/CatalogPage'
import { BooksPage } from '../../features/books/pages/BooksPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { LoansPage } from '../../features/loans/pages/LoansPage'
import { UsersPage } from '../../features/users/pages/UsersPage'
import type { UserRole } from '../../types'
import { useAuth } from '../../features/auth/use-auth'
import { MainLayout } from '../layouts/MainLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AccessDeniedPage } from '../pages/AccessDeniedPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ReservationsPage } from '../../features/reservations/pages/ReservationsPage'

type RouteGuardProps = {
  allowedRoles: UserRole[]
  children: ReactNode
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user: currentUser, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <p>Cargando sesión…</p>
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return children
}

function RequireRole({ allowedRoles, children }: RouteGuardProps) {
  return <RequireAuth><RoleGate allowedRoles={allowedRoles}>{children}</RoleGate></RequireAuth>
}

function RoleGate({ allowedRoles, children }: RouteGuardProps) {
  const { user: currentUser } = useAuth()

  if (!currentUser || !allowedRoles.includes(currentUser.role ?? 'lector')) {
    return <Navigate to="/403" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/dashboard" element={<RequireRole allowedRoles={['admin', 'lector']}><DashboardPage /></RequireRole>} />
        <Route path="/books" element={<RequireRole allowedRoles={['admin', 'lector']}><BooksPage /></RequireRole>} />
        <Route path="/users" element={<RequireRole allowedRoles={['admin']}><UsersPage /></RequireRole>} />
        <Route path="/loans" element={<RequireRole allowedRoles={['admin', 'lector']}><LoansPage /></RequireRole>} />
        <Route path="/reservations" element={<RequireRole allowedRoles={['lector']}><ReservationsPage /></RequireRole>} />
      </Route>
    </Routes>
  )
}
