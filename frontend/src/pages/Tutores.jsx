import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../services/auth.js'

import { getLocalTutores } from '../services/tutoresLocal.js'


function getTutorName(tutor) {
  const user = tutor?.usuario || tutor?.user || {}
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return fullName || tutor?.nombre || tutor?.name || user.username || 'Tutor sin nombre'
}

function getTutorSubjects(tutor) {
  const subjects = tutor?.materias || tutor?.subjects || []
  if (!Array.isArray(subjects)) return []

  return subjects
    .map((subject) => {
      if (typeof subject === 'string') return subject
      return subject?.nombre || subject?.name || subject?.nombre_display || ''
    })
    .filter(Boolean)
}

function getAvailability(tutor) {
  if (typeof tutor?.disponibilidad === 'string') return tutor.disponibilidad
  if (tutor?.disponibilidad === true) return 'Disponible'
  return 'Disponible'
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'TU'
}

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5a2.5 2.5 0 0 0 2.5-2.5z" /></>,
    refresh: <><path d="M20 11a8.3 8.3 0 0 0-14.1-5L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8.3 8.3 0 0 0 14.1 5L20 16" /><path d="M20 20v-4h-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    logout: <><path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function Tutores() {
  const navigate = useNavigate()
  const [materia, setMateria] = useState('')
  const [search, setSearch] = useState('')
  const currentUser = getCurrentUser()
  const localTutores = useMemo(() => getLocalTutores(), [])

  const subjects = useMemo(() => {
    const unique = new Set()
    localTutores.forEach((tutor) => getTutorSubjects(tutor).forEach((subject) => unique.add(subject)))
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'))
  }, [localTutores])

  const filteredTutores = useMemo(() => {
    const query = search.trim().toLowerCase()

    return localTutores.filter((tutor) => {
      const name = getTutorName(tutor).toLowerCase()
      const tutorSubjects = getTutorSubjects(tutor)
      const matchesMateria = !materia || tutorSubjects.includes(materia)
      const matchesSearch = !query || `${name} ${tutorSubjects.join(' ')}`.toLowerCase().includes(query)
      return matchesMateria && matchesSearch
    })
  }, [localTutores, materia, search])

  const visibleSubjects = useMemo(() => {
    const unique = new Set()
    filteredTutores.forEach((tutor) => getTutorSubjects(tutor).forEach((subject) => unique.add(subject)))
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'es'))
  }, [filteredTutores])

  const clearFilters = () => {
    setSearch('')
    setMateria('')
  }

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="tutors-page">
      <div className="tutors-background tutors-background-one" aria-hidden="true" />
      <div className="tutors-background tutors-background-two" aria-hidden="true" />
      <div className="tutors-grid-glow" aria-hidden="true" />

      <header className="tutors-header">
        <button className="tutors-brand tutors-brand-button" type="button" onClick={() => navigate('/tutores')} aria-label="Ir a tutores">
          <span className="tutors-brand-mark">T</span>
          <span className="tutors-brand-copy">
            <strong>Tutorías</strong>
            <small>Acompañamiento académico</small>
          </span>
        </button>

        <div className="tutors-header-actions">
          <span className="student-role-chip">
            <span className="student-role-dot" />
            Estudiante
          </span>
          <span className="academic-chip">
            <span className="academic-chip-dot" />
            Espacio académico
          </span>
          {currentUser?.name && <span className="header-user-name">{currentUser.name}</span>}
          <button className="header-logout-button" type="button" onClick={handleLogout}>
            <Icon name="logout" size={15} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      <section className="tutors-shell">
        <div className="tutors-topbar">
          <div className="breadcrumb">
            <span>Inicio</span>
            <span>/</span>
            <strong>Tutores</strong>
          </div>
          <div className="catalog-status">
            <span className="catalog-status-icon"><Icon name="check" size={13} /></span>
            Catálogo académico
          </div>
        </div>

        <section className="tutors-hero">
          <div className="tutors-hero-copy">
            <p className="tutors-eyebrow">Acompañamiento académico</p>
            <h1>Encuentra el tutor adecuado para avanzar.</h1>
            <p className="tutors-description">
              Explora perfiles por nombre o materia y encuentra apoyo para reforzar tus conocimientos.
            </p>

            <div className="hero-points" aria-label="Características">
              <span><Icon name="check" size={13} /> Por materia</span>
              <span><Icon name="check" size={13} /> Perfiles claros</span>
              <span><Icon name="check" size={13} /> Disponible ahora</span>
            </div>
          </div>

          <div className="hero-summary">
            <span className="summary-label">Tutores encontrados</span>
            <strong>{filteredTutores.length}</strong>
            <div className="summary-meta">
              <span>{visibleSubjects.length} materias visibles</span>
              <span className="summary-dot" />
              <span>Actualizado</span>
            </div>
          </div>
        </section>

        <section className="tutors-toolbar" aria-label="Filtros de tutores">
          <div className="toolbar-intro">
            <span className="toolbar-kicker">Explorar tutores</span>
            <span className="toolbar-note">Usa uno o ambos filtros.</span>
          </div>

          <div className="toolbar-controls">
            <label className="toolbar-field">
              <span>Buscar</span>
              <div className="toolbar-input-wrap">
                <Icon name="search" size={17} />
                <input
                  type="search"
                  placeholder="Nombre o materia..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Buscar tutor por nombre o materia"
                />
              </div>
            </label>

            <label className="toolbar-field">
              <span>Materia</span>
              <div className="toolbar-input-wrap toolbar-select-wrap">
                <Icon name="book" size={17} />
                <select value={materia} onChange={(event) => setMateria(event.target.value)} aria-label="Filtrar por materia">
                  <option value="">Todas las materias</option>
                  {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </div>
            </label>

            <button className="toolbar-clear" type="button" onClick={clearFilters} disabled={!search && !materia}>
              <Icon name="refresh" size={16} />
              <span>Restablecer</span>
            </button>
          </div>
        </section>

        <div className="results-bar">
          <div>
            <span>Resultados</span>
            <strong>{filteredTutores.length}</strong>
          </div>
          <div className="results-filter">
            {materia ? `Filtrado por ${materia}` : 'Mostrando todos los tutores'}
          </div>
        </div>

        <section className="tutors-grid" aria-live="polite">
          {filteredTutores.map((tutor, index) => {
            const name = getTutorName(tutor)
            const tutorSubjects = getTutorSubjects(tutor)
            const availability = getAvailability(tutor)
            const accent = ['blue', 'indigo', 'teal', 'slate', 'cyan', 'violet'][index % 6]

            return (
              <article className={`tutor-card tutor-card-${accent}`} key={tutor.id ?? name}>
                <div className="tutor-card-topline">
                  <span className="profile-label">Tutor académico</span>
                  <span className="availability-badge">
                    <span />
                    {availability}
                  </span>
                </div>

                <div className="tutor-profile">
                  <div className="tutor-avatar">
                    <span>{initials(name)}</span>
                  </div>
                  <div className="tutor-profile-copy">
                    <h2>{name}</h2>
                    <p>Apoyo personalizado según tus necesidades de aprendizaje.</p>
                  </div>
                </div>

                <div className="tutor-divider" />

                <div className="tutor-subjects">
                  <div className="subject-heading-row">
                    <span>Materias</span>
                    <span>{tutorSubjects.length} {tutorSubjects.length === 1 ? 'asignatura' : 'asignaturas'}</span>
                  </div>
                  <div className="subject-list">
                    {tutorSubjects.map((subject) => <span className="subject-chip" key={subject}>{subject}</span>)}
                  </div>
                </div>

                <button
                  className="tutor-card-footer tutor-card-action"
                  type="button"
                  onClick={() => navigate('/solicitar-tutoria', { state: { tutor } })}
                  aria-label={`Solicitar tutoría con ${name}`}
                >
                  <span className="tutor-cta-label"><Icon name="calendar" size={14} /> Solicitar tutoría</span>
                  <span className="footer-arrow"><Icon name="arrow" size={16} /></span>
                </button>
              </article>
            )
          })}
        </section>

        {filteredTutores.length === 0 && (
          <section className="empty-state">
            <div className="empty-icon"><Icon name="search" size={20} /></div>
            <p className="empty-kicker">Sin coincidencias</p>
            <h2>No encontramos tutores con esos filtros.</h2>
            <p>Prueba con otra materia o cambia el texto de búsqueda.</p>
            <button type="button" onClick={clearFilters}>Ver todos los tutores</button>
          </section>
        )}

        <footer className="tutors-footer">
          <div className="footer-brand-mini">
            <span className="footer-mark">T</span>
            <span>Tutorías</span>
          </div>
          <span className="footer-center-copy">Encuentra apoyo para tus materias</span>
          <span>Espacio académico</span>
        </footer>
      </section>
    </main>
  )
}

export default Tutores
