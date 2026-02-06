import { GlassCard } from '../components/GlassCard.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

export function ProfilePage() {
  const { user, profile, role } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">My Profile</h2>
        <p className="mt-1 text-zinc-600">Your sign-in details and role.</p>
      </div>

      <GlassCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Email</div>
            <div className="mt-1 text-sm font-semibold text-zinc-900">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Role</div>
            <div className="mt-1 text-sm font-semibold text-blue-700">{role}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Firestore user doc</div>
            <pre className="mt-2 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">
              {JSON.stringify(profile ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

