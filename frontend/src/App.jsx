import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Tutores from './pages/Tutores.jsx'
import SolicitudesRecibidas from './pages/SolicitudesRecibidas.jsx'
import GestionarSolicitud from './pages/GestionarSolicitud.jsx'
import SolicitarTutoria from './pages/SolicitarTutoria.jsx'
import { getCurrentRole, getHomePath, isAuthenticated } from './services/auth.js'
import './App.css'

function ProtectedRoute({ children, role }) {
  if (!isAuthenticated() || !getCurrentRole()) return <Navigate to="/login" replace />

  if (role && getCurrentRole() !== role) {
    return <Navigate to={getHomePath()} replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated() && getCurrentRole() ? getHomePath() : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route
        path="/tutores"
        element={
          <ProtectedRoute role="estudiante">
            <Tutores />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solicitar-tutoria"
        element={
          <ProtectedRoute role="estudiante">
            <SolicitarTutoria />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestionar-solicitud/:id"
        element={
          <ProtectedRoute role="tutor">
            <GestionarSolicitud />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solicitudes-recibidas"
        element={
          <ProtectedRoute role="tutor">
            <SolicitudesRecibidas />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated() && getCurrentRole() ? getHomePath() : '/login'} replace />} />
    </Routes>
  )
}

export default App
