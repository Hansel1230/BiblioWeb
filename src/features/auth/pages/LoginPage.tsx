import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  email: z.string().email('Debe ingresar un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    console.log('Login payload', data)
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
