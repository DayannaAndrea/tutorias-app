const REQUESTS_KEY = 'tutorias_solicitudes'

const INITIAL_REQUESTS = [
  { id: 'demo-1', estudiante: 'Camila Herrera', tutorId: 'local-1', tutor: 'María Gómez', materia: 'Matemáticas', fecha: '28 sep. 2026', hora: '3:00 p. m.', estado: 'Pendiente', nota: 'Necesito reforzar integrales y ejercicios de aplicación.' },
  { id: 'demo-2', estudiante: 'Samuel Torres', tutorId: 'local-2', tutor: 'Carlos Martínez', materia: 'Programación', fecha: '29 sep. 2026', hora: '10:00 a. m.', estado: 'Pendiente', nota: 'Quiero revisar estructuras de datos y complejidad.' },
  { id: 'demo-3', estudiante: 'Laura Méndez', tutorId: 'local-3', tutor: 'Laura Rodríguez', materia: 'Bases de Datos', fecha: '30 sep. 2026', hora: '2:30 p. m.', estado: 'Aceptada', nota: 'Me gustaría practicar consultas SQL.' },
  { id: 'demo-4', estudiante: 'Daniel Rojas', tutorId: 'local-4', tutor: 'Andrés Castro', materia: 'Cálculo', fecha: '01 oct. 2026', hora: '8:00 a. m.', estado: 'Rechazada', nota: 'Repasar límites y continuidad.' },
  { id: 'demo-5', estudiante: 'Andrea Salas', tutorId: 'local-5', tutor: 'Valentina Rojas', materia: 'Ingeniería de Software', fecha: '02 oct. 2026', hora: '4:00 p. m.', estado: 'Pendiente', nota: 'Necesito orientación para modelar el proyecto.' },
  { id: 'demo-6', estudiante: 'Miguel Castro', tutorId: 'local-6', tutor: 'Santiago López', materia: 'Estadística', fecha: '03 oct. 2026', hora: '11:30 a. m.', estado: 'Aceptada', nota: 'Repasar distribución normal y ejercicios.' },
]

function readRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem(REQUESTS_KEY) || 'null')
    if (Array.isArray(stored)) return stored
  } catch {
    // Use initial local data if storage is invalid.
  }

  localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_REQUESTS))
  return INITIAL_REQUESTS
}

function writeRequests(requests) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests))
  return requests
}

export function getRequests() {
  return readRequests()
}

export function getRequestsForTutor(tutorId) {
  const normalizedId = String(tutorId || '')
  if (!normalizedId) return []
  return readRequests().filter((request) => String(request.tutorId || '') === normalizedId)
}

export function addRequest(request) {
  const requests = readRequests()
  const nextRequest = {
    id: request.id || `local-${Date.now()}`,
    estudiante: request.estudiante || 'Estudiante',
    estudianteEmail: request.estudianteEmail || '',
    tutorId: request.tutorId || '',
    tutor: request.tutor || 'Tutor',
    materia: request.materia || '',
    fecha: request.fecha || '',
    hora: request.hora || '',
    nota: request.nota || '',
    estado: 'Pendiente',
  }

  writeRequests([nextRequest, ...requests])
  return nextRequest
}

export function updateRequestStatus(id, estado) {
  if (!['Aceptada', 'Rechazada'].includes(estado)) return null

  const requests = readRequests().map((request) => (
    String(request.id) === String(id) && request.estado === 'Pendiente'
      ? { ...request, estado }
      : request
  ))

  writeRequests(requests)
  return requests.find((request) => String(request.id) === String(id)) || null
}

export function getRequestById(id) {
  return readRequests().find((request) => String(request.id) === String(id)) || null
}
