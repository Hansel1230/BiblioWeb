import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <section className="status-page">
    <h1>Página no encontrada</h1>
    <p>La dirección que buscas no existe.</p>
    <Link className="primary-button" to="/catalog">Volver al catálogo</Link>
  </section>
}
