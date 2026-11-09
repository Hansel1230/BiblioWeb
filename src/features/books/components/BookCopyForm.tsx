import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { CreateBookCopyInput } from '../../../types'

const copySchema = z.object({
  codigoInventario: z.string().trim().min(1, 'El código de inventario es obligatorio.'),
  notas: z.string().trim().optional(),
})

type CopyFormValues = z.infer<typeof copySchema>

type BookCopyFormProps = {
  isPending: boolean
  onSubmit: (input: CreateBookCopyInput) => void
}

export function BookCopyForm({ isPending, onSubmit }: BookCopyFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CopyFormValues>({
    resolver: zodResolver(copySchema),
  })

  function submit(values: CopyFormValues) {
    onSubmit({
      codigoInventario: values.codigoInventario.trim(),
      ...(values.notas ? { notas: values.notas.trim() } : {}),
    })
    reset()
  }

  return (
    <form className="form-panel" onSubmit={(event) => void handleSubmit(submit)(event)}>
      <h2>Agregar ejemplar</h2>
      <div className="form-grid">
        <label className="field">
          Código de inventario
          <input {...register('codigoInventario')} placeholder="INV-00011" aria-invalid={Boolean(errors.codigoInventario)} disabled={isPending} />
          {errors.codigoInventario && <small>{errors.codigoInventario.message}</small>}
        </label>
        <label className="field">
          Notas
          <input {...register('notas')} placeholder="Donación, ubicación, etc." disabled={isPending} />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={isPending}>{isPending ? 'Guardando…' : 'Agregar ejemplar'}</button>
      </div>
    </form>
  )
}
