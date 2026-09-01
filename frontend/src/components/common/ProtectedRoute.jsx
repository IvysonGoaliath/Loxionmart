import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuthStore()
  const location = useLocation()

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}

export function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuthStore()
  const location = useLocation()

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }
  return children
}

export function GuestRoute({ children }) {
  const { isLoggedIn } = useAuthStore()
  if (isLoggedIn()) return <Navigate to="/" replace />
  return children
}
