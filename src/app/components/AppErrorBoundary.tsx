import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error no controlado en la interfaz:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="error-page" role="alert">
        <h1>Algo salió mal</h1>
        <p>No pudimos mostrar esta sección. Recarga la página para intentarlo nuevamente.</p>
        <button type="button" className="primary-button" onClick={this.handleReload}>
          Recargar página
        </button>
      </main>
    )
  }
}
