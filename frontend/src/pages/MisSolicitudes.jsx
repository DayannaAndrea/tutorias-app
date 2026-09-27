import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../services/auth.js'
import { getRequestsForStudent } from '../services/solicitudesService.js'

function formatDate(value) {
  if (!value) return 'Sin fecha'
  if (/[a-záéíóúñ]/i.test(value)) return value
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '')
}

function formatTime(value) {
  if (!value) return 'Sin hora'
  if (/[ap]\. m\./i.test(value)) return value
  const [hours, minutes] = String(value).split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).format(date)
}


function statusClass(status) {
  return String(status || '').toLowerCase().replaceAll(' ', '-')
}

function Icon({ name, size = 18 }) {
  const paths = {
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 0 2.5-2.5z" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    graduation: <><path d="m3 9 9-5 9 5-9 5z" /><path d="M7 11v4.5c0 1.7 2.2 3.5 5 3.5s5-1.8 5-3.5V11" /><path d="M21 9v5" /></>,
    logout: <><path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    pending: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function MisSolicitudes() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const email = currentUser?.email || ''
  const [estado, setEstado] = useState('Todas')
  const [search, setSearch] = useState('')
  const [requests, setRequests] = useState(() => getRequestsForStudent(email))

  useEffect(() => {
    const refresh = () => setRequests(getRequestsForStudent(email))
    const handleStorage = (event) => {
      if (event.key === 'tutorias_solicitudes') refresh()
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', refresh)
    }
  }, [email])

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
      const haystack = `${item.tutor} ${item.materia} ${item.fecha} ${item.hora}`.toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [estado, search, requests])

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="student-requests-page">
      <div className="student-requests-background student-requests-background-one" aria-hidden="true" />
      <div className="student-requests-background student-requests-background-two" aria-hidden="true" />

      <header className="student-requests-header">
        <button className="student-requests-brand" type="button" onClick={() => navigate('/tutores')} aria-label="Ir a tutores">
          <span className="student-requests-brand-mark" aria-hidden="true"><Icon name="book" size={18} /></span>
          <span className="student-requests-brand-copy"><strong>Tutorías</strong><small>Acompañamiento académico</small></span>
        </button>
        <div className="student-requests-header-actions">
          <button className="header-nav-button" type="button" onClick={() => navigate('/tutores')}>Tutores</button>
          <button className="header-nav-button header-nav-button-active" type="button" onClick={() => navigate('/mis-solicitudes')}>Mis solicitudes</button>
          <span className="student-role-chip"><span className="student-role-dot" />Estudiante</span>
          <span className="header-user-profile">
            <span className="header-user-avatar" aria-hidden="true"><Icon name="user" size={15} /></span>
            <span className="header-user-name">{currentUser?.name || 'Usuario'}</span>
          </span>
          <button className="header-logout-button student-requests-logout" type="button" onClick={handleLogout}><Icon name="logout" size={15} /><span>Cerrar sesión</span></button>
        </div>
      </header>

      <section className="student-requests-shell">
        <div className="student-requests-topline">
          <div className="student-requests-breadcrumb"><span>Inicio</span><span>/</span><strong>Mis solicitudes</strong></div>
          <span className="student-requests-status-chip"><Icon name="check" size={13} /> Seguimiento académico</span>
        </div>

        <section className="student-requests-hero">
          <div className="student-requests-hero-copy">
            <p className="student-requests-eyebrow">Tus tutorías</p>
            <h1>Consulta el estado de tus solicitudes.</h1>
            <p>Revisa las solicitudes que enviaste, el horario elegido y la respuesta registrada por cada tutor.</p>
          </div>
          <div className="student-requests-summary">
            <span>Total de solicitudes</span>
            <strong>{counts.todas}</strong>
            <small>{counts.pendientes} pendientes de respuesta</small>
          </div>
        </section>

        <section className="student-requests-toolbar" aria-label="Filtros de solicitudes">
          <div className="student-requests-search"><Icon name="search" size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por tutor o materia..." aria-label="Buscar mis solicitudes" /></div>
          <div className="student-requests-filter-group" role="tablist" aria-label="Filtrar por estado">
            {['Todas', 'Pendiente', 'Aceptada', 'Rechazada'].map((option) => {
              const count = option === 'Todas' ? counts.todas : option === 'Pendiente' ? counts.pendientes : option === 'Aceptada' ? counts.aceptadas : counts.rechazadas
              return <button key={option} type="button" className={estado === option ? 'is-active' : ''} onClick={() => setEstado(option)} role="tab" aria-selected={estado === option}>{option}<span>{count}</span></button>
            })}
          </div>
        </section>

        <div className="student-requests-results-bar">
          <div><span>Solicitudes</span><strong>{filtered.length}</strong></div>
          <span>{estado === 'Todas' ? 'Mostrando todas' : `Estado: ${estado}`}</span>
        </div>

        <section className="student-requests-list" aria-live="polite">
          {filtered.map((item, index) => (
            <article className={`student-request-card student-request-card-${index % 4}`} key={item.id}>
              <div className="student-request-main">
                <div className="student-request-avatar" aria-hidden="true"><Icon name="graduation" size={21} /></div>
                <div className="student-request-person">
                  <span>Solicitud enviada</span>
                  <h2>{item.tutor}</h2>
                  <p>{item.materia || 'Tutoría general'}</p>
                </div>
              </div>

              <div className="student-request-meta">
                <div><span><Icon name="calendar" size={14} /> Fecha</span><strong>{formatDate(item.fecha)}</strong></div>
                <div><span><Icon name="clock" size={14} /> Hora</span><strong>{formatTime(item.hora)}</strong></div>
                <div><span><Icon name="book" size={14} /> Materia</span><strong>{item.materia || 'Tutoría general'}</strong></div>
              </div>

              <div className="student-request-status">
                <span className={`request-state request-state-${statusClass(item.estado)}`}><span /> {item.estado}</span>
                <p>
                  {item.estado === 'Pendiente' && 'El tutor todavía no ha respondido a esta solicitud.'}
                  {item.estado === 'Aceptada' && 'El tutor aceptó la solicitud. La tutoría quedó confirmada.'}
                  {item.estado === 'Rechazada' && 'El tutor rechazó la solicitud. Puedes enviar una nueva solicitud desde el catálogo.'}
                </p>
              </div>
            </article>
          ))}
        </section>

        {filtered.length === 0 && (
          <section className="student-requests-empty">
            <div className="student-requests-empty-icon"><Icon name="pending" size={21} /></div>
            <p>{requests.length ? 'No encontramos solicitudes con estos filtros.' : 'Todavía no has enviado solicitudes.'}</p>
            {requests.length ? <button type="button" onClick={() => { setSearch(''); setEstado('Todas') }}>Limpiar filtros</button> : <button type="button" onClick={() => navigate('/tutores')}>Explorar tutores <Icon name="arrow" size={15} /></button>}
          </section>
        )}

        <footer className="student-requests-footer"><span><b aria-hidden="true"><Icon name="book" size={13} /></b> Tutorías</span><small>Seguimiento de solicitudes asociadas a tu cuenta.</small></footer>
      </section>
    </main>
  )
}

export default MisSolicitudes
