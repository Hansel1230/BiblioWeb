import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { BooksPage } from '../../features/books/pages/BooksPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { LoansPage } from '../../features/loans/pages/LoansPage'
import { UsersPage } from '../../features/users/pages/UsersPage'
import { MainLayout } from '../layouts/MainLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/loans" element={<LoansPage />} />
      </Route>
    </Routes>
  )
}
