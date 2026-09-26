import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../services/auth.js'
import { getRequestsForTutor } from '../services/solicitudesService.js'

function formatDate(value) {
  if (!value || value.includes('sep.') || value.includes('oct.')) return value || 'Sin fecha'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '')
}

function formatTime(value) {
  if (!value || value.includes('a. m.') || value.includes('p. m.')) return value || 'Sin hora'
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'ES'
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 0 2.5-2.5z" /></>,
    logout: <><path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function SolicitudesRecibidas() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const tutorId = currentUser?.email ? `account-${currentUser.email}` : ''
  const [estado, setEstado] = useState('Todas')
  const [search, setSearch] = useState('')
  const requests = useMemo(() => getRequestsForTutor(tutorId), [tutorId])

  const counts = useMemo(() => ({
    todas: requests.length,
    pendientes: requests.filter((item) => item.estado === 'Pendiente').length,
    aceptadas: requests.filter((item) => item.estado === 'Aceptada').length,
    rechazadas: requests.filter((item) => item.estado === 'Rechazada').length,
  }), [requests])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((item) => {
      const matchesStatus = estado === 'Todas' || item.estado === estado
      const haystack = `${item.estudiante} ${item.materia} ${item.fecha}`.toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [estado, search, requests])

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="requests-page">
      <div className="requests-background requests-background-one" aria-hidden="true" />
      <div className="requests-background requests-background-two" aria-hidden="true" />
      <header className="requests-header">
        <button className="requests-brand" type="button" onClick={() => navigate('/solicitudes-recibidas')} aria-label="Ir al panel del tutor">
          <span className="requests-brand-mark">T</span>
          <span className="requests-brand-copy"><strong>Tutorías</strong><small>Acompañamiento académico</small></span>
        </button>
        <div className="requests-header-actions">
          <span className="tutor-role-chip"><span className="tutor-role-dot" />Tutor</span>
          {currentUser?.name && <span className="requests-user-name">{currentUser.name}</span>}
          <button className="requests-logout" type="button" onClick={handleLogout}><Icon name="logout" size={15} /> Cerrar sesión</button>
        </div>
      </header>

      <section className="requests-shell">
        <div className="requests-topline">
          <div className="requests-breadcrumb"><span>Inicio</span><span>/</span><strong>Solicitudes recibidas</strong></div>
          <span className="requests-status-chip"><span /> Bandeja del tutor</span>
        </div>

        <section className="requests-hero">
          <div className="requests-hero-copy">
            <p className="requests-eyebrow">Área del tutor</p>
            <h1>Revisa las solicitudes que te llegan.</h1>
            <p>Consulta quién solicita la tutoría, la materia, el horario y el estado de cada solicitud.</p>
          </div>
          <div className="requests-summary">
            <div className="requests-summary-main"><span>Total de solicitudes</span><strong>{counts.todas}</strong><small>Asociadas a tu perfil</small></div>
            <div className="requests-summary-mini-row"><span><b>{counts.pendientes}</b> pendientes</span><span><b>{counts.aceptadas}</b> aceptadas</span><span><b>{counts.rechazadas}</b> rechazadas</span></div>
          </div>
        </section>

        <section className="requests-toolbar" aria-label="Filtros de solicitudes">
          <div className="requests-search-wrap"><Icon name="search" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante o materia..." aria-label="Buscar solicitudes" /></div>
          <div className="requests-filter-group" role="tablist" aria-label="Filtrar solicitudes por estado">
            {['Todas', 'Pendiente', 'Aceptada', 'Rechazada'].map((option) => (
              <button key={option} type="button" className={estado === option ? 'is-active' : ''} onClick={() => setEstado(option)} role="tab" aria-selected={estado === option}>{option}<span>{option === 'Todas' ? counts.todas : requests.filter((item) => item.estado === option).length}</span></button>
            ))}
          </div>
        </section>

        <div className="requests-results-bar"><div><span>Solicitudes</span><strong>{filtered.length}</strong></div><span>{estado === 'Todas' ? 'Todas las solicitudes' : `Estado: ${estado}`}</span></div>

        <section className="requests-list" aria-live="polite">
          {filtered.map((item, index) => (
            <article className={`request-item request-item-${index % 4}`} key={item.id}>
              <div className="request-item-main"><div className="request-student-avatar">{initials(item.estudiante)}</div><div className="request-student-copy"><span className="request-item-kicker">Solicitud de tutoría</span><h2>{item.estudiante}</h2><p>{item.materia}</p></div></div>
              <div className="request-meta-grid">
                <div className="request-meta-cell"><span><Icon name="calendar" size={14} /> Fecha</span><strong>{formatDate(item.fecha)}</strong></div>
                <div className="request-meta-cell"><span><Icon name="clock" size={14} /> Hora</span><strong>{formatTime(item.hora)}</strong></div>
                <div className="request-meta-cell"><span><Icon name="book" size={14} /> Materia</span><strong>{item.materia}</strong></div>
              </div>
              <div className="request-item-side">
                <span className={`request-state request-state-${item.estado.toLowerCase()}`}><span /> {item.estado}</span>
                <p>{item.nota || 'Sin motivo indicado.'}</p>
                <button type="button" className="request-view-button" onClick={() => navigate(`/gestionar-solicitud/${item.id}`)}>{item.estado === 'Pendiente' ? 'Gestionar solicitud' : 'Ver solicitud'} <Icon name="arrow" size={15} /></button>
              </div>
            </article>
          ))}
        </section>

        {filtered.length === 0 && (
          <section className="requests-empty">
            <div className="requests-empty-icon"><Icon name="search" size={20} /></div>
            <p>{requests.length ? 'No encontramos solicitudes con estos filtros.' : 'Todavía no tienes solicitudes recibidas.'}</p>
            {requests.length > 0 && <button type="button" onClick={() => { setSearch(''); setEstado('Todas') }}>Limpiar filtros</button>}
          </section>
        )}

        <footer className="requests-footer"><span className="requests-footer-brand"><span>T</span>Tutorías</span><span>Consulta las solicitudes vinculadas a tu cuenta.</span></footer>
      </section>
    </main>
  )
}

export default SolicitudesRecibidas
