import { GlassCard } from '../components/GlassCard.jsx'

export function BlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Blog</h2>
        <p className="mt-1 text-zinc-600">Coming soon — dojo posts and updates.</p>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold text-blue-700">Sample post</div>
        <div className="mt-2 text-sm text-zinc-600">
          Replace this with Firestore-backed posts when you’re ready.
        </div>
      </GlassCard>
    </div>
  )
}

