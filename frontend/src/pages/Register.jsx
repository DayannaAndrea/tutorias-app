import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { saveAccount, signIn, getHomePath } from '../services/auth.js'

function getStrength(password) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'estudiante',
    subjects: '',
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordScore = useMemo(() => getStrength(form.password), [form.password])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleRoleChange = (role) => {
    setForm((current) => ({ ...current, role }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
      setError('Completa todos los campos para continuar.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const account = saveAccount(form)
    signIn(account)
    navigate(getHomePath(), { replace: true })
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Elige cómo participarás en la plataforma y completa tus datos."
      login={false}
      register
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label>Tipo de cuenta</label>
          <div className="role-choice-grid" role="radiogroup" aria-label="Selecciona el tipo de cuenta">
            <button
              type="button"
              className={`role-choice ${form.role === 'estudiante' ? 'role-choice-active' : ''}`}
              onClick={() => handleRoleChange('estudiante')}
              role="radio"
              aria-checked={form.role === 'estudiante'}
            >
              <span className="role-choice-icon">E</span>
              <span className="role-choice-copy">
                <strong>Estudiante</strong>
                <small>Buscar tutores y solicitar tutorías</small>
              </span>
            </button>

            <button
              type="button"
              className={`role-choice ${form.role === 'tutor' ? 'role-choice-active' : ''}`}
              onClick={() => handleRoleChange('tutor')}
              role="radio"
              aria-checked={form.role === 'tutor'}
            >
              <span className="role-choice-icon">T</span>
              <span className="role-choice-copy">
                <strong>Tutor</strong>
                <small>Recibir y gestionar solicitudes</small>
              </span>
            </button>
          </div>
        </div>

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

        {form.role === 'tutor' && (
          <div className="field-group">
            <label htmlFor="subjects">Materias que enseñas</label>
            <div className="input-shell">
              <input
                id="subjects"
                name="subjects"
                type="text"
                placeholder="Ej. Programación, Bases de Datos"
                value={form.subjects}
                onChange={handleChange}
                autoComplete="off"
              />
              <span className="input-detail" aria-hidden="true">+
              </span>
            </div>
            <small className="field-help">Separa varias materias con comas.</small>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="register-email">Correo electrónico</label>
          <div className="input-shell">
            <input
              id="register-email"
              name="email"
              type="text"
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
                placeholder="Cualquier contraseña"
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

        <button className="primary-button" type="submit">
          <span>Crear cuenta</span>
          <span className="button-arrow" aria-hidden="true">→</span>
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
