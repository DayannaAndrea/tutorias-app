import { Link, useLocation } from 'react-router-dom'

const highlights = [
  ['Acompañamiento', 'Encuentra apoyo para avanzar en tus asignaturas.'],
  ['Organización', 'Gestiona tus solicitudes desde un mismo espacio.'],
  ['Seguimiento', 'Consulta el estado de cada tutoría de forma clara.'],
]

function AuthLayout({ title, subtitle, children, register, login }) {
  const location = useLocation()

  return (
    <main className="auth-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <div className="grid-overlay" />
      <div className="noise-overlay" />

      <section className="auth-shell">
        <aside className="auth-intro">
          <div className="intro-topline">
            <span className="status-dot" aria-hidden="true" />
            <span>Plataforma académica</span>
          </div>

          <div className="intro-content">
            <div className="brand-lockup">
              <div className="brand-text-only">
                <p className="brand-name">Tutorías</p>
                <p className="brand-subtitle">Acompañamiento académico</p>
              </div>
            </div>

            <p className="eyebrow">Tu progreso empieza aquí</p>
            <h2>Aprende con apoyo. Avanza con propósito.</h2>
            <p className="intro-text">
              Un espacio pensado para conectar estudiantes con acompañamiento académico de manera simple, ordenada y cercana.
            </p>

            <div className="intro-points">
              {highlights.map(([titleText, description], index) => (
                <div className="intro-point" key={titleText}>
                  <span className="point-number">0{index + 1}</span>
                  <div>
                    <strong>{titleText}</strong>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="intro-footer">
            <span>Acceso seguro</span>
            <span className="footer-separator" aria-hidden="true" />
            <span>Experiencia centrada en el estudiante</span>
          </div>

          <div className="orbital orbital-one" aria-hidden="true" />
          <div className="orbital orbital-two" aria-hidden="true" />
          <div className="signal-line signal-one" aria-hidden="true" />
          <div className="signal-line signal-two" aria-hidden="true" />
        </aside>

        <section className="auth-panel">
          <div className="auth-card">
            <div className="mobile-brand brand-lockup">
              <div className="brand-text-only">
                <p className="brand-name">Tutorías</p>
                <p className="brand-subtitle">Acompañamiento académico</p>
              </div>
            </div>

            <div className="auth-heading">
              <div className="auth-kicker">
                <span>{register ? 'Crear cuenta' : 'Bienvenido'}</span>
                <span className="auth-kicker-line" />
              </div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Tipo de acceso">
              <Link className={location.pathname === '/login' ? 'mode-active' : ''} to="/login">
                Iniciar sesión
              </Link>
              <Link className={location.pathname === '/registro' ? 'mode-active' : ''} to="/registro">
                Registrarse
              </Link>
            </div>

            {children}

            <div className="auth-trust">
              <span className="trust-lock" aria-hidden="true" />
              Tus datos se gestionan dentro de la plataforma académica.
            </div>

            <div className="auth-switch">
              {register ? (
                <>
                  <span>¿Ya tienes una cuenta?</span>
                  <Link to="/login">Iniciar sesión</Link>
                </>
              ) : (
                <>
                  <span>¿Primera vez en Tutorías?</span>
                  <Link to="/registro">Crear una cuenta</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default AuthLayout
