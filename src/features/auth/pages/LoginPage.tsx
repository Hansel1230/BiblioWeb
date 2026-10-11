import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import type { User } from '../../../types'

const DEFAULT_PASSWORD = 'Biblioweb#1234'

const loginSchema = z.object({
  email: z.string().email('Debe ingresar un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    const savedUsers = JSON.parse(window.localStorage.getItem('biblioweb-users') ?? '[]') as User[]
    const normalizedEmail = data.email.toLowerCase()
    const adminEmail = 'admin@biblioweb.com'
    const normalizedUsers = savedUsers.map((user) => ({
      ...user,
      password: user.email.toLowerCase() === adminEmail ? 'Volumen#1' : DEFAULT_PASSWORD,
    }))

    const requestedAdmin = {
      id: 4,
      name: 'Administrador',
      email: 'Admin@biblioweb.com',
      password: 'Volumen#1',
      role: 'admin' as const,
      active: true,
    }
    const existingAdminIndex = normalizedUsers.findIndex((user) => user.email.toLowerCase() === adminEmail)

    if (existingAdminIndex === -1 && normalizedEmail === adminEmail) {
      normalizedUsers.push(requestedAdmin)
      window.localStorage.setItem('biblioweb-users', JSON.stringify(normalizedUsers))
    } else if (existingAdminIndex !== -1) {
      normalizedUsers[existingAdminIndex] = requestedAdmin
      window.localStorage.setItem('biblioweb-users', JSON.stringify(normalizedUsers))
    }

    const matchedUser = normalizedUsers.find(
      (user) => user.email.toLowerCase() === data.email.toLowerCase(),
    )

    if (!matchedUser || matchedUser.password !== data.password) {
      setError('email', { type: 'manual', message: 'Credenciales incorrectas.' })
      setError('password', { type: 'manual', message: 'Credenciales incorrectas.' })
      return
    }

    const currentUser = {
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
    }

    window.localStorage.setItem('biblioweb-current-user', JSON.stringify(currentUser))
    navigate('/dashboard')
  }

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
        <p className="eyebrow">Acceso</p>
        <h1>BiblioWeb</h1>
        <label>
          Correo electrónico
          <input {...register('email')} type="email" placeholder="usuario@biblioweb.com" />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </label>

        <label>
          Contraseña
          <input {...register('password')} type="password" placeholder="••••••••" />
          {errors.password && <span className="error-text">{errors.password.message}</span>}
        </label>

        <button type="submit" className="primary-button full-width">
          Iniciar sesión
        </button>
      </form>
    </section>
  )
}
