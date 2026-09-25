import api from './api'

export async function getTutores(materia = '') {
  const params = materia ? { materia } : undefined
  const response = await api.get('/tutores/', { params })
  return Array.isArray(response.data) ? response.data : response.data.results || []
}
