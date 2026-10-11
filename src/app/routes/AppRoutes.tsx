import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { BooksPage } from '../../features/books/pages/BooksPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { LoansPage } from '../../features/loans/pages/LoansPage'
import { UsersPage } from '../../features/users/pages/UsersPage'
import type { UserRole } from '../../types'
import { MainLayout } from '../layouts/MainLayout'

type RouteGuardProps = {
  allowedRoles: UserRole[]
  children: ReactNode
}

function RequireRole({ allowedRoles, children }: RouteGuardProps) {
  if (typeof window === 'undefined') {
    return children
  }

  const currentUser = JSON.parse(window.localStorage.getItem('biblioweb-current-user') ?? 'null') as
    | { role?: UserRole }
    | null

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(currentUser.role ?? 'lector')) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<RequireRole allowedRoles={['admin', 'lector']}><BooksPage /></RequireRole>} />
        <Route path="/users" element={<RequireRole allowedRoles={['admin']}><UsersPage /></RequireRole>} />
        <Route path="/loans" element={<RequireRole allowedRoles={['admin', 'lector']}><LoansPage /></RequireRole>} />
      </Route>
    </Routes>
  )
}
