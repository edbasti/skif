import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

export function RequireAuth({ children }) {
  const { loading, isAuthed } = useAuth()
  if (loading) return <div className="text-zinc-600">Loading…</div>
  if (!isAuthed) return <Navigate to="/signin" replace />
  return children
}
