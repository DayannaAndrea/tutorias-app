import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { getAccountByEmail, getHomePath, signIn } from '../services/auth.js'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.email.trim() || !form.password.trim()) {
      setError('Completa tu correo y contraseña para continuar.')
      return
    }

    const account = getAccountByEmail(form.email)
    signIn({
      name: account?.name,
      email: form.email,
      role: account?.role,
    })

    navigate(getHomePath(), { replace: true })
  }

  return (
    <AuthLayout
      title="Inicia tu sesión"
      subtitle="Ingresa con tus datos para continuar con tus tutorías."
      login
      register={false}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="email">Correo electrónico</label>
          <div className="input-shell">
            <input
              id="email"
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

        <div className="field-group">
          <div className="field-heading">
            <label htmlFor="password">Contraseña</label>
            <span>Acceso personal</span>
          </div>
          <div className="input-shell password-shell">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
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
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="primary-button" type="submit">
          <span>Ingresar</span>
          <span className="button-arrow" aria-hidden="true">→</span>
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
