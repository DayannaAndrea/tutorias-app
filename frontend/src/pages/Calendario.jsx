import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getCurrentRole, signOut } from '../services/auth.js'
import { getRequests } from '../services/solicitudesService.js'

function Icon({ name, size = 18 }) {
  const paths = {
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 0 2.5-2.5z" /></>,
    user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
    graduation: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.4V16c2.9 2 7.1 2 10 0v-4.6" /><path d="M21 10v5" /></>,
    arrowLeft: <><path d="M15 18l-6-6 6-6" /><path d="M9 12h11" /></>,
    arrowRight: <><path d="m9 18 6-6-6-6" /><path d="M4 12h11" /></>,
    logout: <><path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function parseRequestDate(value) {
  if (!value) return null
  const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const spanish = String(value).toLowerCase().replace(/\./g, '').trim()
  const match = spanish.match(/^(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s+(\d{4})$/)
  if (!match) return null

  const months = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 }
  const date = new Date(Number(match[3]), months[match[2]], Number(match[1]))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(value) {
  if (!value) return 'Sin hora'
  if (String(value).includes('a. m.') || String(value).includes('p. m.')) return value
  const [hours, minutes] = String(value).split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

function formatMonth(date) {
  const text = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const first = new Date(year, month, 1)
  const mondayOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
}

function Calendario() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const role = getCurrentRole()
  const [requests, setRequests] = useState(() => getRequests())
  const [monthDate, setMonthDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    const refresh = () => setRequests(getRequests())
    window.addEventListener('storage', refresh)
    window.addEventListener('tutorias_solicitudes_updated', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('tutorias_solicitudes_updated', refresh)
    }
  }, [])

  const acceptedSessions = useMemo(() => {
    const email = String(currentUser?.email || '').trim().toLowerCase()
    const tutorId = email ? `account-${email}` : ''

    return requests
      .filter((request) => {
        if (request.estado !== 'Aceptada') return false
        if (role === 'tutor') return String(request.tutorId || '') === tutorId
        return String(request.estudianteEmail || '').trim().toLowerCase() === email
      })
      .map((request) => ({ ...request, dateObject: parseRequestDate(request.fecha) }))
      .filter((request) => request.dateObject)
      .sort((a, b) => a.dateObject - b.dateObject || String(a.hora).localeCompare(String(b.hora)))
  }, [currentUser?.email, requests, role])

  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate])
  const monthSessions = useMemo(() => acceptedSessions.filter((session) => session.dateObject.getFullYear() === monthDate.getFullYear() && session.dateObject.getMonth() === monthDate.getMonth()), [acceptedSessions, monthDate])
  const selectedSessions = useMemo(() => selectedDate ? acceptedSessions.filter((session) => sameDay(session.dateObject, selectedDate)) : [], [acceptedSessions, selectedDate])

  const monthCount = monthSessions.length
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const nextSession = acceptedSessions.find((session) => session.dateObject >= todayStart) || null

  const goMonth = (delta) => {
    setSelectedDate(null)
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1))
  }

  const goToday = () => {
    const today = new Date()
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  const isTutor = role === 'tutor'

  return (
    <main className="calendar-page">
      <div className="calendar-background calendar-background-one" aria-hidden="true" />
      <div className="calendar-background calendar-background-two" aria-hidden="true" />
      <div className="calendar-grid-glow" aria-hidden="true" />

      <header className="calendar-header">
        <button className="calendar-brand" type="button" onClick={() => navigate(isTutor ? '/solicitudes-recibidas' : '/tutores')} aria-label="Ir al inicio de tu espacio">
          <span className="calendar-brand-mark" aria-hidden="true"><Icon name="book" size={19} /></span>
          <span className="calendar-brand-copy"><strong>Tutorías</strong><small>Acompañamiento académico</small></span>
        </button>

        <div className="calendar-header-actions">
          {isTutor ? (
            <button className="header-nav-button" type="button" onClick={() => navigate('/solicitudes-recibidas')}>Solicitudes</button>
          ) : (
            <>
              <button className="header-nav-button" type="button" onClick={() => navigate('/tutores')}>Tutores</button>
              <button className="header-nav-button" type="button" onClick={() => navigate('/mis-solicitudes')}>Mis solicitudes</button>
            </>
          )}
          <button className="header-nav-button header-nav-button-active" type="button" onClick={() => navigate('/calendario')}>Calendario</button>
          <span className={isTutor ? 'tutor-role-chip' : 'student-role-chip'}><span className={isTutor ? 'tutor-role-dot' : 'student-role-dot'} />{isTutor ? 'Tutor' : 'Estudiante'}</span>
          <span className={`header-user-profile ${isTutor ? 'header-user-profile-tutor' : ''}`}>
            <span className="header-user-avatar" aria-hidden="true"><Icon name="user" size={15} /></span>
            <span className="header-user-name">{currentUser?.name || 'Usuario'}</span>
          </span>
          <button className={isTutor ? 'requests-logout' : 'header-logout-button'} type="button" onClick={handleLogout}><Icon name="logout" size={15} /><span>Cerrar sesión</span></button>
        </div>
      </header>

      <section className="calendar-shell">
        <div className="calendar-topline">
          <div className="calendar-breadcrumb"><span>Inicio</span><span>/</span><strong>Calendario</strong></div>
          <span className="calendar-status-chip"><Icon name="calendar" size={13} /> Tutorías confirmadas</span>
        </div>

        <section className="calendar-hero">
          <div className="calendar-hero-copy">
            <p className="calendar-eyebrow">Tu agenda académica</p>
            <h1>Organiza tus tutorías confirmadas.</h1>
            <p>Consulta tus sesiones aceptadas en un solo lugar, ordenadas por fecha y con el horario listo para revisar.</p>
          </div>
          <div className="calendar-summary-card">
            <span>Sesiones confirmadas</span>
            <strong>{acceptedSessions.length}</strong>
            <small>{monthCount} este mes</small>
          </div>
        </section>

        <section className="calendar-content">
          <div className="calendar-panel">
            <div className="calendar-toolbar">
              <div>
                <span className="calendar-toolbar-kicker">Agenda</span>
                <h2>{formatMonth(monthDate)}</h2>
              </div>
              <div className="calendar-toolbar-actions">
                <button type="button" className="calendar-icon-button" onClick={() => goMonth(-1)} aria-label="Mes anterior"><Icon name="arrowLeft" size={18} /></button>
                <button type="button" className="calendar-today-button" onClick={goToday}>Hoy</button>
                <button type="button" className="calendar-icon-button" onClick={() => goMonth(1)} aria-label="Mes siguiente"><Icon name="arrowRight" size={18} /></button>
              </div>
            </div>

            <div className="calendar-weekdays" aria-hidden="true">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <span key={day}>{day}</span>)}
            </div>

            <div className="calendar-grid" role="grid" aria-label={`Calendario de ${formatMonth(monthDate)}`}>
              {days.map((day) => {
                const sessions = acceptedSessions.filter((session) => sameDay(session.dateObject, day))
                const isCurrentMonth = day.getMonth() === monthDate.getMonth()
                const isToday = sameDay(day, new Date())
                const isSelected = selectedDate && sameDay(day, selectedDate)

                return (
                  <button
                    key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                    type="button"
                    className={`calendar-day ${isCurrentMonth ? '' : 'calendar-day-muted'} ${isToday ? 'calendar-day-today' : ''} ${isSelected ? 'calendar-day-selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                    role="gridcell"
                    aria-label={`${formatLongDate(day)}${sessions.length ? `, ${sessions.length} tutoría confirmada${sessions.length === 1 ? '' : 's'}` : ''}`}
                  >
                    <span className="calendar-day-number">{day.getDate()}</span>
                    {sessions.length > 0 && (
                      <span className="calendar-day-events">
                        {sessions.slice(0, 2).map((session) => <span className="calendar-event-dot" key={session.id} />)}
                        {sessions.length > 2 && <span className="calendar-event-more">+{sessions.length - 2}</span>}
                      </span>
                    )}
                    {sessions.slice(0, 1).map((session) => <span className="calendar-day-subject" key={`subject-${session.id}`}>{session.materia}</span>)}
                  </button>
                )
              })}
            </div>
          </div>

          <aside className="calendar-side-panel">
            <div className="calendar-side-heading">
              <div>
                <span>Detalle</span>
                <h2>{selectedDate ? formatLongDate(selectedDate) : 'Próxima tutoría'}</h2>
              </div>
              <span className="calendar-side-icon"><Icon name="calendar" size={18} /></span>
            </div>

            {selectedDate ? (
              selectedSessions.length ? (
                <div className="calendar-session-list">
                  {selectedSessions.map((session) => (
                    <article className="calendar-session-card" key={session.id}>
                      <div className="calendar-session-icon"><Icon name="graduation" size={19} /></div>
                      <div className="calendar-session-copy">
                        <span>{isTutor ? 'Estudiante' : 'Tutor'}</span>
                        <h3>{isTutor ? session.estudiante : session.tutor}</h3>
                        <p>{session.materia}</p>
                      </div>
                      <strong className="calendar-session-time"><Icon name="clock" size={14} /> {formatTime(session.hora)}</strong>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="calendar-empty-small">
                  <div className="calendar-empty-icon"><Icon name="calendar" size={19} /></div>
                  <h3>No hay tutorías ese día</h3>
                  <p>Selecciona otra fecha para consultar tus sesiones confirmadas.</p>
                </div>
              )
            ) : nextSession ? (
              <div className="calendar-next-card">
                <span className="calendar-next-label">Siguiente sesión</span>
                <h3>{isTutor ? nextSession.estudiante : nextSession.tutor}</h3>
                <p>{nextSession.materia}</p>
                <div className="calendar-next-meta">
                  <span><Icon name="calendar" size={14} /> {formatLongDate(nextSession.dateObject)}</span>
                  <span><Icon name="clock" size={14} /> {formatTime(nextSession.hora)}</span>
                </div>
              </div>
            ) : (
              <div className="calendar-empty-small">
                <div className="calendar-empty-icon"><Icon name="calendar" size={19} /></div>
                <h3>Aún no tienes tutorías confirmadas</h3>
                <p>Cuando una solicitud sea aceptada, aparecerá automáticamente aquí.</p>
                {!isTutor && <button type="button" onClick={() => navigate('/tutores')}>Explorar tutores</button>}
              </div>
            )}

            <div className="calendar-side-note">
              <Icon name="clock" size={15} />
              <span>Solo se muestran las tutorías con estado aceptado.</span>
            </div>
          </aside>
        </section>

        {acceptedSessions.length > 0 && (
          <section className="calendar-upcoming-section">
            <div className="calendar-section-heading">
              <div>
                <span>Agenda</span>
                <h2>Tus próximas sesiones</h2>
              </div>
              <span>{acceptedSessions.length} confirmada{acceptedSessions.length === 1 ? '' : 's'}</span>
            </div>
            <div className="calendar-upcoming-grid">
              {acceptedSessions.slice(0, 4).map((session) => (
                <article className="calendar-upcoming-card" key={session.id}>
                  <div className="calendar-upcoming-date"><strong>{session.dateObject.getDate()}</strong><span>{new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(session.dateObject).replace('.', '')}</span></div>
                  <div className="calendar-upcoming-copy">
                    <span>{session.materia}</span>
                    <h3>{isTutor ? session.estudiante : session.tutor}</h3>
                    <small><Icon name="clock" size={13} /> {formatTime(session.hora)}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="calendar-footer"><span><Icon name="book" size={14} /> Tutorías</span><small>Tu agenda se actualiza con las solicitudes aceptadas.</small></footer>
      </section>
    </main>
  )
}

export default Calendario
