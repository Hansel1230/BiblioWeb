type SuccessMessageProps = { message: string }

export function SuccessMessage({ message }: SuccessMessageProps) {
  return <p className="success-message" role="status" aria-live="polite">{message}</p>
}
