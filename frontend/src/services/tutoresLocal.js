import { getAccounts } from './auth.js'

export const STATIC_TUTORES = [
  {
    id: 'local-1',
    usuario: { first_name: 'María', last_name: 'Gómez' },
    materias: ['Matemáticas', 'Cálculo'],
    disponibilidad: 'Disponible',
  },
  {
    id: 'local-2',
    usuario: { first_name: 'Carlos', last_name: 'Martínez' },
    materias: ['Programación', 'Bases de Datos'],
    disponibilidad: 'Disponible',
  },
  {
    id: 'local-3',
    usuario: { first_name: 'Laura', last_name: 'Rodríguez' },
    materias: ['Estadística', 'Matemáticas'],
    disponibilidad: 'Disponible',
  },
  {
    id: 'local-4',
    usuario: { first_name: 'Andrés', last_name: 'Castro' },
    materias: ['Programación', 'Ingeniería de Software'],
    disponibilidad: 'Disponible',
  },
  {
    id: 'local-5',
    usuario: { first_name: 'Valentina', last_name: 'Rojas' },
    materias: ['Física', 'Cálculo'],
    disponibilidad: 'Disponible',
  },
  {
    id: 'local-6',
    usuario: { first_name: 'Santiago', last_name: 'López' },
    materias: ['Bases de Datos', 'Estadística'],
    disponibilidad: 'Disponible',
  },
]

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    first_name: parts.shift() || 'Tutor',
    last_name: parts.join(' '),
  }
}

function normalizeSubjects(subjects) {
  if (Array.isArray(subjects)) {
    return subjects.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof subjects === 'string') {
    return subjects.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return []
}

export function getLocalTutores() {
  const registeredTutors = Object.values(getAccounts())
    .filter((account) => account?.role === 'tutor')
    .map((account) => {
      const nameParts = splitName(account.name || account.email)
      const subjects = normalizeSubjects(account.subjects)

      return {
        id: `account-${account.email}`,
        usuario: nameParts,
        materias: subjects,
        disponibilidad: 'Disponible',
        email: account.email,
        localRegistered: true,
      }
    })

  const knownEmails = new Set(registeredTutors.map((tutor) => tutor.email).filter(Boolean))
  const staticTutors = STATIC_TUTORES.filter((tutor) => !knownEmails.has(tutor.email))

  return [...registeredTutors, ...staticTutors]
}
