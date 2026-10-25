import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { BooksPage } from '../../features/books/pages/BooksPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { LoansPage } from '../../features/loans/pages/LoansPage'
import { UsersPage } from '../../features/users/pages/UsersPage'
import type { UserRole } from '../../types'
import { getCurrentUser } from '../../lib/auth/session'
import { MainLayout } from '../layouts/MainLayout'

type RouteGuardProps = {
  allowedRoles: UserRole[]
  children: ReactNode
}

function RequireRole({ allowedRoles, children }: RouteGuardProps) {
  if (typeof window === 'undefined') {
    return children
  }

  const currentUser = getCurrentUser()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(currentUser.role ?? 'lector')) {
    return <Navigate to="/403" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<p> No tienes permisos para acceder a esta sección.</p>} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RequireRole allowedRoles={['admin', 'lector']}><DashboardPage /></RequireRole>} />
        <Route path="/books" element={<RequireRole allowedRoles={['admin', 'lector']}><BooksPage /></RequireRole>} />
        <Route path="/users" element={<RequireRole allowedRoles={['admin']}><UsersPage /></RequireRole>} />
        <Route path="/loans" element={<RequireRole allowedRoles={['admin', 'lector']}><LoansPage /></RequireRole>} />
      </Route>
      <Route path="*" element={<p>Página no encontrada.</p>} />
    </Routes>
  )
}
