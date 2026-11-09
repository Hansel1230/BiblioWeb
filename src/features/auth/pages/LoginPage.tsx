import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../lib/api/client'
import { useAuth } from '../use-auth'

const loginSchema = z.object({
  email: z.string().email('Debe ingresar un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
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
      await login(data.email.toLowerCase(), data.password)
      const state = location.state as { from?: string } | null
      const fromQuery = new URLSearchParams(location.search).get('from')
      navigate(state?.from ?? fromQuery ?? '/dashboard', { replace: true })
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      const message = error instanceof ApiError
        ? error.status === 400 || error.status === 422
          ? error.details?.[0] ?? 'Los datos de acceso no son válidos.'
          : error.status === 401
            ? 'Correo o contraseña incorrectos.'
            : error.status === 403
              ? 'El usuario está bloqueado o no tiene acceso.'
              : error.status >= 500
                ? 'La API no pudo iniciar sesión. Intenta nuevamente.'
                : error.status === 0
                  ? 'No se pudo conectar con la API.'
                  : error.details?.[0] ?? error.message
        : 'No se pudo iniciar sesión. Verifica tus credenciales o la conexión.'
      setError('password', {
        type: 'manual',
        message,
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
          <input id="login-email" {...register('email')} type="email" placeholder="usuario@biblioweb.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} />
          {errors.email && <span id="login-email-error" className="error-text" role="alert">{errors.email.message}</span>}
        </label>

        <label>
          Contraseña
          <input id="login-password" {...register('password')} type="password" placeholder="••••••••" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} />
          {errors.password && <span id="login-password-error" className="error-text" role="alert">{errors.password.message}</span>}
        </label>

        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
        <div className="auth-links">
          <Link to="/register">Crear cuenta de lector</Link>
          <Link to="/catalog">Consultar catálogo</Link>
        </div>
      </form>
    </section>
  )
}
