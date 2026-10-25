import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import type { SessionUser } from '../../../types'
import { apiPost } from '../../../lib/api/client'
import { endpoints } from '../../../lib/api/endpoints'
import { saveCurrentUser } from '../../../lib/auth/session'

const loginSchema = z.object({
  email: z.string().email('Debe ingresar un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>
type AuthenticatedUser = SessionUser & { active: boolean }
type LoginResponse = AuthenticatedUser | { user: AuthenticatedUser }

export function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await apiPost<LoginResponse, LoginFormValues>(endpoints.auth, {
        email: data.email.toLowerCase(),
        password: data.password,
      })
      const currentUser = 'user' in response ? response.user : response

      if (!currentUser.active) {
        setError('email', { type: 'manual', message: 'El usuario está desactivado.' })
        return
      }

      saveCurrentUser({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      setError('password', {
        type: 'manual',
        message: 'No se pudo iniciar sesión. Verifica tus credenciales o la conexión.',
      })
    }
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

        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
        <Link to="/register">Crear cuenta de lector</Link>
        <Link to="/catalog">Consultar catálogo</Link>
      </form>
    </section>
  )
}
