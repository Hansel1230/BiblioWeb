import { Link, useNavigate } from 'react-router-dom'

export function AccessDeniedPage() {
  const navigate = useNavigate()
  return <section className="status-page">
    <h1>Acceso denegado</h1>
    <p>No tienes permisos para acceder a esta sección.</p>
    <div className="form-actions">
      <button type="button" className="secondary-button" onClick={() => navigate(-1)}>Volver</button>
      <Link className="primary-button" to="/catalog">Ir al catálogo</Link>
    </div>
  </section>
}
