import { z } from 'zod'

export const tokenResponseSchema = z.object({
  token: z.string().min(1),
  expira: z.string().datetime({ offset: true }),
})

export const userResponseSchema = z.object({
  id: z.number(),
  nombreCompleto: z.string().min(1),
  correo: z.string().email(),
  rol: z.union([
    z.enum(['Administrator', 'Librarian', 'Reader', 'Student']),
    z.number().int().min(0).max(3),
  ]),
  estado: z.union([
    z.enum(['Active', 'Inactive', 'Blocked']),
    z.number().int().min(0).max(2),
  ]),
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
