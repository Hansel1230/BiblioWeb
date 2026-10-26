import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/auth-service'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre'),
  email: z.string().email('Debe ingresar un correo válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Las contraseñas no coinciden',
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        name: data.name,
        password: data.password,
        email: data.email.toLowerCase(),
      })
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      setError('email', { type: 'manual', message: 'No se pudo completar el registro.' })
    }
  }

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit(onSubmit)}>
        <p className="eyebrow">Registro</p>
        <h1>Crear cuenta de lector</h1>
        <label>Nombre<input id="register-name" {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} />{errors.name && <span id="register-name-error" className="error-text" role="alert">{errors.name.message}</span>}</label>
        <label>Correo electrónico<input id="register-email" {...register('email')} type="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />{errors.email && <span id="register-email-error" className="error-text" role="alert">{errors.email.message}</span>}</label>
        <label>Contraseña<input id="register-password" {...register('password')} type="password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} />{errors.password && <span id="register-password-error" className="error-text" role="alert">{errors.password.message}</span>}</label>
        <label>Confirmar contraseña<input id="register-confirm-password" {...register('confirmPassword')} type="password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined} />{errors.confirmPassword && <span id="register-confirm-password-error" className="error-text" role="alert">{errors.confirmPassword.message}</span>}</label>
        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando…' : 'Registrarme'}
        </button>
        <Link to="/login">Ya tengo una cuenta</Link>
      </form>
    </section>
  )
}
