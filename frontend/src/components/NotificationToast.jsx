import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentRole, getCurrentUser } from '../services/auth.js'
import { getNotificationsForUser, markAllNotificationsAsRead, markNotificationAsRead } from '../services/notifications.js'

function Icon({ name, size = 18 }) {
  const paths = {
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" /><path d="M10 21h4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    close: <><path d="m7 7 10 10" /><path d="m17 7-10 10" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function NotificationToast() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const role = getCurrentRole()
  const [notifications, setNotifications] = useState(() => getNotificationsForUser(user?.email, { unreadOnly: true }))

  useEffect(() => {
    const refresh = () => setNotifications(getNotificationsForUser(user?.email, { unreadOnly: true }))
    window.addEventListener('tutorias_notificaciones_updated', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('tutorias_notificaciones_updated', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [user?.email])

  const current = notifications[0]
  const hasNotifications = useMemo(() => Boolean(current), [current])

  if (role !== 'estudiante' || !hasNotifications) return null

  const handleClose = () => {
    markAllNotificationsAsRead(user?.email)
    setNotifications([])
  }

  const handleOpen = () => {
    if (current?.id) markNotificationAsRead(current.id)
    navigate('/mis-solicitudes')
    setNotifications((items) => items.slice(1))
  }

  return (
    <aside className="app-notification-toast" role="status" aria-live="polite">
      <div className="app-notification-icon"><Icon name="bell" size={19} /></div>
      <div className="app-notification-content">
        <div className="app-notification-heading">
          <span>Actualización de solicitud</span>
          <button type="button" onClick={handleClose} aria-label="Cerrar notificación"><Icon name="close" size={15} /></button>
        </div>
        <strong>{current.title}</strong>
        <p>{current.message}</p>
        <small><Icon name="calendar" size={12} /> {current.detail}</small>
        <button type="button" className="app-notification-link" onClick={handleOpen}>Ver mis solicitudes <Icon name="arrow" size={14} /></button>
      </div>
    </aside>
  )
}

export default NotificationToast
