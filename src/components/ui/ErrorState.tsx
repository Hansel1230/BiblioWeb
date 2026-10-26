type ErrorStateProps = { message: string; onRetry?: () => void }

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="error-state">
      <p className="error-text">{message}</p>
      {onRetry && <button type="button" className="secondary-button" onClick={onRetry}>Reintentar</button>}
    </div>
  )
}
