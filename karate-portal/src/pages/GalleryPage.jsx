import { GlassCard } from '../components/GlassCard.jsx'

export function GalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Gallery</h2>
        <p className="mt-1 text-zinc-300">A place to show your dojo’s best moments.</p>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold text-white">Gallery</div>
        <div className="mt-2 text-sm text-zinc-300">
          You can later connect this to Firebase Storage + Firestore like the Home carousel.
        </div>
      </GlassCard>
    </div>
  )
}

