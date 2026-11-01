type LoadingStateProps = { message?: string }

export function LoadingState({ message = 'Cargando…' }: LoadingStateProps) {
  return <p role="status" aria-live="polite">{message}</p>
}
