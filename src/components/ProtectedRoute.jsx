import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { loading, user, isAdmin } = useAuth()

  if (loading) {
    return <p className="muted">Loading...</p>
  }

  if (!user) {
    return <Navigate to="/auth?mode=signin" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
