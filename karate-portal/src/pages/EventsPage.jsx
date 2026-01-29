import { GlassCard } from '../components/GlassCard.jsx'

export function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Events</h2>
        <p className="mt-1 text-zinc-300">Seminars, gradings, tournaments, and meetups.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard>
          <div className="text-sm font-semibold text-white">Upcoming</div>
          <div className="mt-2 text-sm text-zinc-300">No events yet.</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold text-white">Past</div>
          <div className="mt-2 text-sm text-zinc-300">No past events yet.</div>
        </GlassCard>
      </div>
    </div>
  )
}

