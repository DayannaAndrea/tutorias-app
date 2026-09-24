import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.email.trim() || !form.password) {
      setError('Completa tu correo y contraseña para continuar.')
      return
    }

    setError('')
    setLoading(true)

    window.setTimeout(() => {
      setLoading(false)
      console.log('Login', form)
    }, 650)
  }

  return (
    <AuthLayout
      title="Inicia tu sesión"
      subtitle="Ingresa con tu correo institucional para continuar con tus tutorías."
      login
      register={false}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="email">Correo institucional</label>
          <div className="input-shell">
            <input
              id="email"
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

        <button className="primary-button" type="submit" disabled={loading}>
          <span>{loading ? 'Validando acceso' : 'Iniciar sesión'}</span>
          <span className="button-arrow" aria-hidden="true">→</span>
        </button>
      </form>
    </AuthLayout>
  )
}

export default Login
