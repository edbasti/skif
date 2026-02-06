import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

export function RequireAdmin({ children }) {
  const { loading, isAuthed, isAdmin } = useAuth()
  if (loading) return <div className="text-zinc-600">Loading…</div>
  if (!isAuthed) return <Navigate to="/signin" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
