import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth.js'
import { addRequest } from '../services/solicitudesService.js'

import { getLocalTutores } from '../services/tutoresLocal.js'


function getTutorName(tutor) {
  const user = tutor?.usuario || tutor?.user || {}
  return [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || tutor?.nombre || tutor?.name || 'Tutor académico'
}

function getSubjects(tutor) {
  const subjects = tutor?.materias || tutor?.subjects || []
  return Array.isArray(subjects)
    ? subjects.map((subject) => typeof subject === 'string' ? subject : subject?.nombre || subject?.name || '').filter(Boolean)
    : []
}

function Icon({ name, size = 18 }) {
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 0 2.5-2.5z" /></>,
    user: <><circle cx="12" cy="8" r="3.1" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'TU'
}

function getTodayString() {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

function SolicitarTutoria() {
  const navigate = useNavigate()
  const location = useLocation()
  const tutores = useMemo(() => getLocalTutores(), [])
  const initialTutor = location.state?.tutor || tutores[0]
  const [tutorId, setTutorId] = useState(initialTutor?.id || tutores[0]?.id || '')
  const [materia, setMateria] = useState(getSubjects(initialTutor)[0] || '')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [nota, setNota] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const currentUser = getCurrentUser()

  const tutor = useMemo(() => tutores.find((item) => item.id === tutorId) || initialTutor, [tutorId, initialTutor, tutores])
  const tutorSubjects = getSubjects(tutor)
  const subjects = tutorSubjects.length ? tutorSubjects : ['Tutoría general']
  const tutorName = getTutorName(tutor)

  const handleTutorChange = (event) => {
    const nextTutor = tutores.find((item) => item.id === event.target.value)
    setTutorId(event.target.value)
    const nextSubjects = getSubjects(nextTutor)
    setMateria(nextSubjects[0] || 'Tutoría general')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    const request = addRequest({
      id: Date.now(),
      estudiante: currentUser?.name || 'Estudiante',
      tutorId,
      tutor: tutorName,
      estudianteEmail: currentUser?.email || '',
      materia,
      fecha,
      hora,
      nota,
    })

    sessionStorage.setItem('solicitud_tutoria', JSON.stringify(request))
  }

  if (submitted) {
    return (
      <main className="request-page">
        <div className="request-bg request-bg-one" aria-hidden="true" />
        <div className="request-bg request-bg-two" aria-hidden="true" />
        <header className="request-header">
          <button className="request-brand" type="button" onClick={() => navigate('/tutores')}>
            <span className="request-brand-mark">T</span>
            <span><strong>Tutorías</strong><small>Acompañamiento académico</small></span>
          </button>
        </header>
        <section className="request-shell request-success-shell">
          <div className="request-success-icon"><Icon name="check" size={26} /></div>
          <p className="request-eyebrow">Solicitud enviada</p>
          <h1>Tu solicitud quedó registrada.</h1>
          <p className="request-success-copy">Revisa los datos antes de continuar. La solicitud queda en estado pendiente mientras el tutor responde.</p>

          <div className="request-summary-card">
            <div className="request-summary-title">Detalle de la solicitud</div>
            <div className="request-summary-grid">
              <div><span>Tutor</span><strong>{tutorName}</strong></div>
              <div><span>Materia</span><strong>{materia}</strong></div>
              <div><span>Fecha</span><strong>{fecha}</strong></div>
              <div><span>Hora</span><strong>{hora}</strong></div>
              <div><span>Estado</span><strong className="request-pending">Pendiente</strong></div>
            </div>
          </div>

          <div className="request-success-actions">
            <button className="request-secondary-button" type="button" onClick={() => navigate('/tutores')}>
              <Icon name="back" size={17} /> Volver a tutores
            </button>
            <button className="request-primary-button" type="button" onClick={() => setSubmitted(false)}>
              Nueva solicitud <Icon name="arrow" size={17} />
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="request-page">
      <div className="request-bg request-bg-one" aria-hidden="true" />
      <div className="request-bg request-bg-two" aria-hidden="true" />

      <header className="request-header">
        <button className="request-brand" type="button" onClick={() => navigate('/tutores')}>
          <span className="request-brand-mark">T</span>
          <span><strong>Tutorías</strong><small>Acompañamiento académico</small></span>
        </button>
        <div className="request-header-links">
          <span className="student-role-chip">
            <span className="student-role-dot" />
            Estudiante
          </span>
          <button className="request-back-link" type="button" onClick={() => navigate('/tutores')}>
            <Icon name="back" size={15} /> Volver a tutores
          </button>
        </div>
      </header>

      <section className="request-shell">
        <div className="request-topline">
          <div className="request-breadcrumb"><span>Inicio</span><span>/</span><span>Tutores</span><span>/</span><strong>Solicitar tutoría</strong></div>
          <span className="request-status-chip"><span /> Espacio académico</span>
        </div>

        <div className="request-layout">
          <aside className="request-aside">
            <p className="request-eyebrow">Nueva solicitud</p>
            <h1>Agenda un espacio de acompañamiento.</h1>
            <p>Elige el tutor, la materia y un horario que te funcione. Puedes dejar una nota para explicar qué necesitas reforzar.</p>

            <div className="request-step-list">
              <div className="request-step active"><span>01</span><div><strong>Información</strong><small>Selecciona tutor y materia</small></div></div>
              <div className="request-step"><span>02</span><div><strong>Horario</strong><small>Indica fecha y hora</small></div></div>
              <div className="request-step"><span>03</span><div><strong>Confirmación</strong><small>Revisa y envía la solicitud</small></div></div>
            </div>
          </aside>

          <section className="request-form-card">
            <div className="request-form-head">
              <div>
                <span className="request-form-kicker">Programar tutoría</span>
                <h2>Cuéntanos cuándo quieres recibir apoyo.</h2>
              </div>
              <span className="request-form-mark"><Icon name="calendar" size={19} /></span>
            </div>

            <form onSubmit={handleSubmit} className="request-form">
              <div className="request-field request-field-full">
                <label htmlFor="tutor"><Icon name="user" size={15} /> Tutor</label>
                <div className="request-control">
                  <select id="tutor" value={tutorId} onChange={handleTutorChange} required>
                    {tutores.map((item) => <option key={item.id} value={item.id}>{getTutorName(item)}</option>)}
                  </select>
                </div>
                <small>Selecciona el tutor con el que deseas solicitar la sesión.</small>
              </div>

              <div className="request-field">
                <label htmlFor="materia"><Icon name="book" size={15} /> Materia</label>
                <div className="request-control">
                  <select id="materia" value={materia} onChange={(event) => setMateria(event.target.value)} required>
                    {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                  </select>
                </div>
              </div>

              <div className="request-field">
                <label htmlFor="fecha"><Icon name="calendar" size={15} /> Fecha</label>
                <div className="request-control">
                  <input id="fecha" type="date" min={getTodayString()} value={fecha} onChange={(event) => setFecha(event.target.value)} required />
                </div>
              </div>

              <div className="request-field">
                <label htmlFor="hora"><Icon name="clock" size={15} /> Hora</label>
                <div className="request-control">
                  <input id="hora" type="time" value={hora} onChange={(event) => setHora(event.target.value)} required />
                </div>
              </div>

              <div className="request-field request-field-full">
                <label htmlFor="nota">Motivo de la tutoría <span>Opcional</span></label>
                <textarea id="nota" rows="4" maxLength="280" placeholder="Ej. Necesito reforzar ejercicios de cálculo diferencial..." value={nota} onChange={(event) => setNota(event.target.value)} />
                <small className="request-note-count">{nota.length}/280</small>
              </div>

              <div className="request-form-footer">
                <div className="request-helper"><span className="request-helper-dot" /><div><strong>Solicitud pendiente</strong><small>Se registrará para revisión del tutor.</small></div></div>
                <button className="request-primary-button request-submit-button" type="submit">
                  Enviar solicitud <Icon name="arrow" size={18} />
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  )
}

export default SolicitarTutoria
