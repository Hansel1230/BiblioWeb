import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { User, UserRole } from '../../../types'
import { getCurrentUser } from '../../../lib/auth/session'
import { MOCK_KEYS, defaultMockUsers } from '../../../mocks/data'
import { UserTable } from '../components/UserTable'

const STORAGE_KEY = MOCK_KEYS.users

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  lector: 'Lector',
}

const defaultUsers = defaultMockUsers

type UserFormData = {
  name: string
  email: string
  role: UserRole
  active: boolean
}

const emptyForm: UserFormData = {
  name: '',
  email: '',
  role: 'lector',
  active: true,
}

function readUsersFromStorage(): User[] {
  if (typeof window === 'undefined') {
    return defaultUsers
  }

  try {
    const savedUsers = window.localStorage.getItem(STORAGE_KEY)

    if (!savedUsers) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers))
      return defaultUsers
    }

    const parsedUsers = JSON.parse(savedUsers) as User[]

    if (Array.isArray(parsedUsers)) {
      return parsedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      }))
    }

    return []
  } catch (error) {
    console.error('Error al leer usuarios guardados:', error)
    return defaultUsers
  }
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => readUsersFromStorage())
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<UserFormData>(emptyForm)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }, [users])

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
    setError('')
  }

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (user: User) => {
    setEditingId(user.id)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    })
    setError('')
    setShowForm(true)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target
    const name = target.name
    const type = target instanceof HTMLInputElement ? target.type : 'select'
    const value = target.value

    if (type === 'checkbox') {
      const checked = target instanceof HTMLInputElement ? target.checked : false
      setFormData((currentForm) => ({ ...currentForm, active: checked }))
      return
    }

    if (name === 'role') {
      setFormData((currentForm) => ({
        ...currentForm,
        role: value as UserRole,
      }))
      return
    }

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = formData.name.trim()
    const email = formData.email.trim()

    if (!name || !email) {
      setError('Completa nombre y correo electrónico.')
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un email válido.')
      return
    }

    if (editingId !== null) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingId
            ? {
                ...user,
                name,
                email,
                role: formData.role,
                active: formData.active,
              }
            : user,
        ),
      )
    } else {
      const newUser: User = {
        id: Date.now(),
        name,
        email,
        role: formData.role,
        active: formData.active,
      }

      setUsers((currentUsers) => [newUser, ...currentUsers])
    }

    resetForm()
  }

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find((user) => user.id === userId)
    const currentUser = getCurrentUser()

    if (!userToDelete) {
      return
    }

    if (userToDelete.role === 'admin') {
      setError('No se puede eliminar un administrador. Desactívalo en su lugar.')
      return
    }

    if (currentUser?.email.toLowerCase() === userToDelete.email.toLowerCase()) {
      setError('No puedes eliminar tu propio usuario.')
      return
    }

    const confirmed = window.confirm(`¿Deseas eliminar al usuario "${userToDelete.name}"?`)

    if (!confirmed) {
      return
    }

    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId))
  }

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Usuarios</p>
          <h1>Gestión de usuarios</h1>
        </div>
        <button type="button" className="primary-button" onClick={openCreateForm}>
          Nuevo usuario
        </button>
      </div>

      {showForm && (
        <form className="form-panel" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? 'Editar usuario' : 'Registrar nuevo usuario'}</h2>

          <div className="form-grid">
            <label className="field">
              <span>Nombre</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej. Ana Gómez"
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ej. ana@biblio.com"
              />
            </label>

            <label className="field">
              <span>Rol</span>
              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="admin">Administrador</option>
                <option value="lector">Lector</option>
              </select>
            </label>

            <label className="field">
              <span>Estado</span>
              <div className="switch-row">
                <span>{formData.active ? 'Activo' : 'Inactivo'}</span>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
              </div>
            </label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={resetForm}>
              Cerrar
            </button>
            <button type="submit" className="primary-button">
              {editingId !== null ? 'Actualizar usuario' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      )}

      <UserTable users={users} roleLabels={roleLabels} onEdit={openEditForm} onDelete={handleDeleteUser} />
    </section>
  )
}
