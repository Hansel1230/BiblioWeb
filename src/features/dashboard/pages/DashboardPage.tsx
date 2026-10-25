import { useDashboard } from '../hooks/useDashboard'

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()

  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Panel general</p>
          <h1>Dashboard de biblioteca</h1>
        </div>
      </div>

      {isLoading && <p>Cargando indicadores…</p>}
      {isError && <p className="error-text">No se pudo cargar el dashboard.</p>}

      {data && (
        <>
          <div className="stats-grid">
            {data.stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span className={stat.positive ? 'trend positive' : 'trend negative'}>
                  {stat.change}
                </span>
              </article>
            ))}
          </div>

          <div className="content-grid">
            <article className="panel">
              <h2>Actividad reciente</h2>
              <ul className="list">
                {data.recentActivity.map((activity) => (
                  <li key={activity.id}><span>{activity.subject}</span><span>{activity.description}</span></li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <h2>Alertas</h2>
              <ul className="list">
                {data.alerts.map((alert) => (
                  <li key={alert.id}><span>{alert.label}</span><span>{alert.detail}</span></li>
                ))}
              </ul>
            </article>
          </div>
        </>
      )}
    </section>
  )
}
