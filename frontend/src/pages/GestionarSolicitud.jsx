import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCurrentUser, signOut } from '../services/auth.js'
import { getRequestById, updateRequestStatus } from '../services/solicitudesService.js'

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
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 0 2.5-2.5z" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    logout: <><path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function GestionarSolicitud() {
  const navigate = useNavigate()
  const { id } = useParams()
  const currentUser = getCurrentUser()
  const [request, setRequest] = useState(() => getRequestById(id))
  const [feedback, setFeedback] = useState('')

  const tutorId = currentUser?.email ? `account-${currentUser.email}` : ''
  const isOwner = useMemo(() => request && String(request.tutorId || '') === tutorId, [request, tutorId])

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  const handleDecision = (status) => {
    if (!request || !isOwner || request.estado !== 'Pendiente') return
    const updated = updateRequestStatus(request.id, status)
    if (!updated) return
    setRequest(updated)
    setFeedback(status === 'Aceptada' ? 'La solicitud fue aceptada y su estado quedó actualizado.' : 'La solicitud fue rechazada y su estado quedó actualizado.')
  }

  if (!request || !isOwner) {
    return (
      <main className="requests-page">
        <section className="requests-shell request-not-found-shell">
          <p className="requests-eyebrow">Solicitud no disponible</p>
          <h1>No puedes gestionar esta solicitud.</h1>
          <p>La solicitud no existe o no está asociada a tu cuenta de tutor.</p>
          <button className="request-primary-button" type="button" onClick={() => navigate('/solicitudes-recibidas')}>Volver a solicitudes</button>
        </section>
      </main>
    )
  }

  const isPending = request.estado === 'Pendiente'

  return (
    <main className="requests-page">
      <div className="requests-background requests-background-one" aria-hidden="true" />
      <div className="requests-background requests-background-two" aria-hidden="true" />

      <header className="requests-header">
        <button className="requests-brand" type="button" onClick={() => navigate('/solicitudes-recibidas')} aria-label="Volver a solicitudes recibidas">
          <span className="requests-brand-mark">T</span>
          <span className="requests-brand-copy"><strong>Tutorías</strong><small>Acompañamiento académico</small></span>
        </button>
        <div className="requests-header-actions">
          <span className="tutor-role-chip"><span className="tutor-role-dot" />Tutor</span>
          {currentUser?.name && <span className="requests-user-name">{currentUser.name}</span>}
          <button className="requests-logout" type="button" onClick={handleLogout}><Icon name="logout" size={15} /> Cerrar sesión</button>
        </div>
      </header>

      <section className="requests-shell manage-shell">
        <div className="requests-topline">
          <div className="requests-breadcrumb"><span>Inicio</span><span>/</span><span>Solicitudes recibidas</span><span>/</span><strong>Gestión</strong></div>
          <span className="requests-status-chip"><span /> Gestión de solicitud</span>
        </div>

        <section className="manage-hero">
          <div>
            <p className="requests-eyebrow">APP-05 · Respuesta del tutor</p>
            <h1>Acepta o rechaza la solicitud.</h1>
            <p>Revisa la información enviada por el estudiante y registra una respuesta sobre la solicitud pendiente.</p>
          </div>
          <span className={`request-state request-state-${request.estado.toLowerCase()}`}><span /> {request.estado}</span>
        </section>

        <section className="manage-card">
          <div className="manage-person">
            <div className="manage-avatar">{initials(request.estudiante)}</div>
            <div><span>Estudiante</span><h2>{request.estudiante}</h2><p>{request.materia}</p></div>
          </div>

          <div className="manage-grid">
            <div><span><Icon name="calendar" size={14} /> Fecha</span><strong>{formatDate(request.fecha)}</strong></div>
            <div><span><Icon name="clock" size={14} /> Hora</span><strong>{formatTime(request.hora)}</strong></div>
            <div><span><Icon name="book" size={14} /> Materia</span><strong>{request.materia || 'Sin materia'}</strong></div>
          </div>

          <div className="manage-note"><span>Motivo de la solicitud</span><p>{request.nota || 'El estudiante no agregó un motivo.'}</p></div>

          {feedback && <div className="manage-feedback"><Icon name="check" size={17} />{feedback}</div>}

          <div className="manage-footer">
            <button className="request-secondary-button" type="button" onClick={() => navigate('/solicitudes-recibidas')}><Icon name="back" size={17} /> Volver a solicitudes</button>
            {isPending ? (
              <div className="manage-decision-actions">
                <button type="button" className="request-action request-action-reject" onClick={() => handleDecision('Rechazada')}>Rechazar</button>
                <button type="button" className="request-action request-action-accept" onClick={() => handleDecision('Aceptada')}>Aceptar</button>
              </div>
            ) : (
              <span className="manage-final-note">La solicitud ya tiene una respuesta registrada.</span>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

export default GestionarSolicitud
