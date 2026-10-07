import type { DashboardStat } from '../../../types'

const stats: DashboardStat[] = [
  { label: 'Préstamos activos', value: '184', change: '+12%', positive: true },
  { label: 'Libros disponibles', value: '1,240', change: '+4%', positive: true },
  { label: 'Usuarios activos', value: '426', change: '+8%', positive: true },
  { label: 'Retrasos', value: '17', change: '-3%', positive: false },
]

export function DashboardPage() {
  return (
    <section className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Panel general</p>
          <h1>Dashboard de biblioteca</h1>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
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
            <li><span>Elena Díaz</span><span>Prestó “El Quijote”</span></li>
            <li><span>Pedro Ruiz</span><span>Devuelve “La Metamorfosis”</span></li>
            <li><span>María López</span><span>Reservó “Cien años de soledad”</span></li>
          </ul>
        </article>

        <article className="panel">
          <h2>Alertas</h2>
          <ul className="list">
            <li><span>3 libros vencidos</span><span>Prioridad alta</span></li>
            <li><span>5 libros reservados</span><span>En proceso</span></li>
            <li><span>2 usuarios nuevos</span><span>Hoy</span></li>
          </ul>
        </article>
      </div>
    </section>
  )
}
