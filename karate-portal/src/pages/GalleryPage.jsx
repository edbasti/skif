import { GlassCard } from '../components/GlassCard.jsx'

export function GalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Gallery</h2>
        <p className="mt-1 text-zinc-600">A place to show your dojo’s best moments.</p>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold text-yellow-700">Gallery</div>
        <div className="mt-2 text-sm text-zinc-600">
          You can later connect this to Firebase Storage + Firestore like the Home carousel.
        </div>
      </GlassCard>
    </div>
  )
}

