import { useMemo, useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'

function getStrength(password) {
  let score = 0

  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  return score
}

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordScore = useMemo(() => getStrength(form.password), [form.password])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError('Completa todos los campos para crear tu cuenta.')
      return
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setLoading(true)

    window.setTimeout(() => {
      setLoading(false)
      console.log('Registro', form)
    }, 650)
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Regístrate para acceder al acompañamiento y gestionar tus solicitudes."
      login={false}
      register
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="name">Nombre completo</label>
          <div className="input-shell">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Escribe tu nombre completo"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
            <span className="input-detail initials" aria-hidden="true">NM</span>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="register-email">Correo institucional</label>
          <div className="input-shell">
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="nombre@universidad.edu.co"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <span className="input-detail" aria-hidden="true">@</span>
          </div>
        </div>

        <div className="form-grid">
          <div className="field-group">
            <label htmlFor="register-password">Contraseña</label>
            <div className="input-shell password-shell">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className="strength-meter" aria-label={`Fortaleza de contraseña: ${passwordScore} de 4`}>
              {[0, 1, 2, 3].map((index) => (
                <span key={index} className={passwordScore > index ? 'strength-active' : ''} />
              ))}
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <div className="input-shell password-shell">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          <span>{loading ? 'Preparando cuenta' : 'Crear cuenta'}</span>
          <span className="button-arrow" aria-hidden="true">→</span>
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
