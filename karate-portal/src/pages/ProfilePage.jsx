import { GlassCard } from '../components/GlassCard.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

export function ProfilePage() {
  const { user, profile, role } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Profile</h2>
        <p className="mt-1 text-zinc-300">Your sign-in details and role.</p>
      </div>

      <GlassCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-400">Email</div>
            <div className="mt-1 text-sm font-semibold text-white">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-400">Role</div>
            <div className="mt-1 text-sm font-semibold text-white">{role}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs uppercase tracking-wide text-zinc-400">Firestore user doc</div>
            <pre className="mt-2 overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-200">
              {JSON.stringify(profile ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

