import { z } from 'zod'

export const tokenResponseSchema = z.object({
  token: z.string().min(1),
  expira: z.string().datetime({ offset: true }),
})

export const userResponseSchema = z.object({
  id: z.number(),
  nombreCompleto: z.string().min(1),
  correo: z.string().email(),
  rol: z.enum(['Administrator', 'Librarian', 'Reader', 'Student']),
  estado: z.enum(['Active', 'Inactive', 'Blocked']),
  fechaCreacion: z.string(),
})

export type LoginRequest = {
  correo: string
  contrasena: string
}

export type RegisterRequest = {
  nombreCompleto: string
  correo: string
  contrasena: string
  rol: 'Student'
}

export type TokenResponse = z.infer<typeof tokenResponseSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
