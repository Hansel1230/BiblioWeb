import type { User, UserRole } from '../../../types'

type UserTableProps = { users: User[]; roleLabels: Record<UserRole, string>; onEdit: (user: User) => void; onDelete: (id: number) => void }

export function UserTable({ users, roleLabels, onEdit, onDelete }: UserTableProps) {
  return <div className="table-panel"><table><caption>Usuarios registrados</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Email</th><th scope="col">Rol</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead><tbody>
    {users.length === 0 ? <tr><td colSpan={5}>No hay usuarios registrados.</td></tr> : users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{roleLabels[user.role]}</td><td><span className={user.active ? 'status ok' : 'status warning'}>{user.active ? 'Activo' : 'Inactivo'}</span></td><td><div className="table-actions"><button type="button" className="table-button secondary-button" onClick={() => onEdit(user)}>Editar</button><button type="button" className="table-button danger-button" onClick={() => onDelete(user.id)}>Eliminar</button></div></td></tr>)}
  </tbody></table></div>
}
