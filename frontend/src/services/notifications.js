const NOTIFICATIONS_KEY = 'tutorias_notificaciones'

function readNotifications() {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function writeNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  window.dispatchEvent(new Event('tutorias_notificaciones_updated'))
  return notifications
}

export function getNotifications() {
  return readNotifications()
}

export function getNotificationsForUser(email, { unreadOnly = false } = {}) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) return []

  return readNotifications()
    .filter((notification) => String(notification.userEmail || '').trim().toLowerCase() === normalizedEmail)
    .filter((notification) => !unreadOnly || !notification.readAt)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
}

export function addStatusNotification({ request, status }) {
  const userEmail = String(request?.estudianteEmail || '').trim().toLowerCase()
  if (!userEmail) return null

  const notification = {
    id: `notification-${Date.now()}-${request.id}`,
    userEmail,
    type: 'solicitud-estado',
    requestId: request.id,
    status,
    title: status === 'Aceptada' ? 'Solicitud aceptada' : 'Solicitud rechazada',
    message: status === 'Aceptada'
      ? `Tu solicitud con ${request.tutor || 'el tutor'} fue aceptada.`
      : `Tu solicitud con ${request.tutor || 'el tutor'} fue rechazada.`,
    detail: `${request.materia || 'Tutoría general'} · ${request.fecha || 'Fecha pendiente'} · ${request.hora || 'Hora pendiente'}`,
    createdAt: Date.now(),
    readAt: null,
  }

  const current = readNotifications()
  return writeNotifications([notification, ...current])
}

export function markNotificationAsRead(id) {
  const notifications = readNotifications().map((notification) => (
    String(notification.id) === String(id) && !notification.readAt
      ? { ...notification, readAt: Date.now() }
      : notification
  ))

  writeNotifications(notifications)
  return notifications.find((notification) => String(notification.id) === String(id)) || null
}

export function markAllNotificationsAsRead(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) return []

  const now = Date.now()
  const notifications = readNotifications().map((notification) => (
    String(notification.userEmail || '').trim().toLowerCase() === normalizedEmail && !notification.readAt
      ? { ...notification, readAt: now }
      : notification
  ))

  writeNotifications(notifications)
  return getNotificationsForUser(normalizedEmail)
}
