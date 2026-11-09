import type { BookCopy, CopyStatus } from '../../../types'

const statusLabels: Record<CopyStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  loaned: 'Prestado',
  maintenance: 'Mantenimiento',
  retired: 'Retirado',
}

type BookCopyTableProps = {
  copies: BookCopy[]
  isPending: boolean
  onStatusChange: (id: number, status: CopyStatus) => void
  onDelete: (id: number) => void
}

export function BookCopyTable({ copies, isPending, onStatusChange, onDelete }: BookCopyTableProps) {
  return (
    <div className="table-panel">
      <table>
        <caption>Ejemplares registrados</caption>
        <thead>
          <tr><th scope="col">Código</th><th scope="col">Estado</th><th scope="col">Notas</th><th scope="col">Acciones</th></tr>
        </thead>
        <tbody>
          {copies.length === 0
            ? <tr><td colSpan={4}>No hay ejemplares registrados.</td></tr>
            : copies.map((copy) => (
              <tr key={copy.id}>
                <td>{copy.inventoryCode}</td>
                <td><span className={`status ${copy.status === 'available' ? 'ok' : copy.status === 'retired' ? 'warning' : 'info'}`}>{statusLabels[copy.status]}</span></td>
                <td>{copy.location ?? 'Sin notas'}</td>
                <td>
                  <div className="table-actions">
                    <select aria-label={`Estado de ${copy.inventoryCode}`} value={copy.status} disabled={isPending || copy.status === 'retired'} onChange={(event) => onStatusChange(copy.id, event.target.value as CopyStatus)}>
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button type="button" className="table-button danger-button" disabled={isPending || copy.status === 'retired'} onClick={() => onDelete(copy.id)}>Retirar</button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
