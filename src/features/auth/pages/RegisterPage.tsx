import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../../../lib/api/client'
import { endpoints } from '../../../lib/api/endpoints'

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
      await apiPost<void, Omit<RegisterFormValues, 'confirmPassword'>>(endpoints.register, {
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
        <label>Nombre<input {...register('name')} />{errors.name && <span className="error-text">{errors.name.message}</span>}</label>
        <label>Correo electrónico<input {...register('email')} type="email" />{errors.email && <span className="error-text">{errors.email.message}</span>}</label>
        <label>Contraseña<input {...register('password')} type="password" />{errors.password && <span className="error-text">{errors.password.message}</span>}</label>
        <label>Confirmar contraseña<input {...register('confirmPassword')} type="password" />{errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}</label>
        <button type="submit" className="primary-button full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando…' : 'Registrarme'}
        </button>
        <Link to="/login">Ya tengo una cuenta</Link>
      </form>
    </section>
  )
}
