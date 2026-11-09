type AlertMessageProps = { message: string }

export function AlertMessage({ message }: AlertMessageProps) {
  return <p className="error-text" role="alert" aria-live="assertive">{message}</p>
}
