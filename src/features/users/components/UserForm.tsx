import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { BackendRole, BackendRoleCode, BackendUserStatus, CreateUserInput, UpdateUserInput, User } from '../../../types'

const baseUserSchema = z.object({
  nombreCompleto: z.string().trim().min(1, 'El nombre es obligatorio.'),
  correo: z.string().trim().email('Indica un correo válido.'),
  rol: z.enum(['Administrator', 'Librarian', 'Reader']),
  estado: z.enum(['Active', 'Inactive', 'Blocked']),
})

const createUserSchema = baseUserSchema.extend({
  contrasena: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})

const editUserSchema = baseUserSchema.extend({
  contrasena: z.string().optional(),
})

type UserFormValues = z.infer<typeof editUserSchema>
type UserFormProps = {
  user?: User
  isPending: boolean
  onSubmit: (input: CreateUserInput | UpdateUserInput) => void
  onCancel: () => void
}

const roles: Array<{ value: BackendRole; label: string }> = [
  { value: 'Administrator', label: 'Administrador' },
  { value: 'Librarian', label: 'Bibliotecario' },
  { value: 'Reader', label: 'Lector' },
]

const roleCodes: Record<Exclude<BackendRole, 'Student'>, BackendRoleCode> = {
  Administrator: 0,
  Librarian: 1,
  Reader: 2,
}

const statuses: Array<{ value: BackendUserStatus; label: string }> = [
  { value: 'Active', label: 'Activo' },
  { value: 'Inactive', label: 'Inactivo' },
  { value: 'Blocked', label: 'Bloqueado' },
]

export function UserForm({ user, isPending, onSubmit, onCancel }: UserFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(user ? editUserSchema : createUserSchema),
    defaultValues: {
      nombreCompleto: user?.name ?? '',
      correo: user?.email ?? '',
      contrasena: '',
      rol: user?.backendRole === 'Administrator' || user?.backendRole === 'Librarian' || user?.backendRole === 'Reader'
        ? user.backendRole
        : user?.role === 'admin' ? 'Administrator' : 'Reader',
      estado: user?.status ?? (user?.active ? 'Active' : 'Inactive'),
    },
  })

  function submit(values: UserFormValues) {
    if (user) {
      const input: UpdateUserInput = {
        nombreCompleto: values.nombreCompleto.trim(),
        correo: values.correo.trim(),
        rol: roleCodes[values.rol],
        estado: values.estado === 'Active' ? 0 : values.estado === 'Inactive' ? 1 : 2,
      }
      onSubmit(input)
      return
    }
    if (!values.contrasena) return
    onSubmit({
      nombreCompleto: values.nombreCompleto.trim(),
      correo: values.correo.trim(),
      contrasena: values.contrasena,
      rol: roleCodes[values.rol],
    })
  }

  return (
    <form className="form-panel" onSubmit={(event) => void handleSubmit(submit)(event)}>
      <h2>{user ? 'Editar usuario' : 'Nuevo usuario'}</h2>
      <div className="form-grid">
        <label className="field">Nombre completo<input {...register('nombreCompleto')} aria-invalid={Boolean(errors.nombreCompleto)} disabled={isPending} />{errors.nombreCompleto && <small>{errors.nombreCompleto.message}</small>}</label>
        <label className="field">Correo<input type="email" {...register('correo')} aria-invalid={Boolean(errors.correo)} disabled={isPending} />{errors.correo && <small>{errors.correo.message}</small>}</label>
        {!user && <label className="field">Contraseña<input type="password" {...register('contrasena')} aria-invalid={Boolean(errors.contrasena)} disabled={isPending} />{errors.contrasena && <small>{errors.contrasena.message}</small>}</label>}
        <label className="field">Rol<select {...register('rol')} disabled={isPending}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
        {user && <label className="field">Estado<select {...register('estado')} disabled={isPending}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>}
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={isPending}>Cancelar</button>
        <button type="submit" className="primary-button" disabled={isPending}>{isPending ? 'Guardando…' : 'Guardar usuario'}</button>
      </div>
    </form>
  )
}
