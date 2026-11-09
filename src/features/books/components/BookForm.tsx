import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Book, Category, CreateBookInput } from '../../../types'

const bookFormSchema = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio.'),
  autor: z.string().trim().min(1, 'El autor es obligatorio.'),
  isbn: z.string().trim().optional(),
  idCategoria: z.string().trim().optional(),
  editorial: z.string().trim().optional(),
  anioPublicacion: z.string().trim().refine((value) => !value || /^\d{4}$/.test(value), 'Indica un año válido de cuatro dígitos.'),
  descripcion: z.string().trim().optional(),
})

type BookFormValues = z.infer<typeof bookFormSchema>

type BookFormProps = {
  book?: Book
  isPending: boolean
  onSubmit: (input: CreateBookInput) => void
  onCancel: () => void
  categories: Category[]
  categoriesLoading: boolean
  categoriesError: boolean
}

function toFormValues(book?: Book): BookFormValues {
  return {
    titulo: book?.title ?? '',
    autor: book?.author ?? '',
    isbn: book?.isbn ?? '',
    idCategoria: book?.categoryId?.toString() ?? '',
    editorial: book?.publisher ?? '',
    anioPublicacion: book?.publicationYear?.toString() ?? '',
    descripcion: book?.description ?? '',
  }
}

export function BookForm({ book, isPending, onSubmit, onCancel, categories, categoriesLoading, categoriesError }: BookFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: toFormValues(book),
  })

  function submit(values: BookFormValues) {
    const input: CreateBookInput = {
      titulo: values.titulo.trim(),
      autor: values.autor.trim(),
      ...(values.isbn ? { isbn: values.isbn.trim() } : {}),
      ...(values.idCategoria ? { idCategoria: Number(values.idCategoria) } : {}),
      ...(values.editorial ? { editorial: values.editorial.trim() } : {}),
      ...(values.anioPublicacion ? { anioPublicacion: Number(values.anioPublicacion) } : {}),
      ...(values.descripcion ? { descripcion: values.descripcion.trim() } : {}),
    }
    onSubmit(input)
  }

  return (
    <form className="form-panel" onSubmit={(event) => void handleSubmit(submit)(event)}>
      <h2>{book ? 'Editar libro' : 'Nuevo libro'}</h2>
      <div className="form-grid">
        <label className="field">Título<input {...register('titulo')} aria-invalid={Boolean(errors.titulo)} />{errors.titulo && <small>{errors.titulo.message}</small>}</label>
        <label className="field">Autor<input {...register('autor')} aria-invalid={Boolean(errors.autor)} />{errors.autor && <small>{errors.autor.message}</small>}</label>
        <label className="field">ISBN<input {...register('isbn')} /></label>
        <label className="field">Categoría
          <select {...register('idCategoria')} disabled={categoriesLoading || categoriesError || isPending}>
            <option value="">{categoriesLoading ? 'Cargando categorías…' : categoriesError ? 'No disponibles' : 'Selecciona una categoría'}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="field">Editorial<input {...register('editorial')} /></label>
        <label className="field">Año de publicación<input inputMode="numeric" {...register('anioPublicacion')} aria-invalid={Boolean(errors.anioPublicacion)} />{errors.anioPublicacion && <small>{errors.anioPublicacion.message}</small>}</label>
        <label className="field full-width">Descripción<textarea {...register('descripcion')} rows={3} /></label>
      </div>
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={isPending}>Cancelar</button>
        <button type="submit" className="primary-button" disabled={isPending || categoriesLoading || categoriesError}>{isPending ? 'Guardando…' : 'Guardar libro'}</button>
      </div>
    </form>
  )
}
