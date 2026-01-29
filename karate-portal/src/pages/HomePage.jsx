import { Carousel } from '../components/Carousel.jsx'
import { GlassCard } from '../components/GlassCard.jsx'

export function HomePage() {
  return (
    <div className="space-y-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
            Our DOJO
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            Training • Community • Events
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Walk the path.
            <span className="block bg-gradient-to-r from-red-400 to-amber-300 bg-clip-text text-transparent">
              Train with purpose.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-zinc-300">
            A simple home for your dojo: announcements, events, a gallery, and player
            profiles—plus admin tools for fund management.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <GlassCard className="p-4">
              <div className="text-sm font-semibold text-white">Respect</div>
              <div className="text-xs text-zinc-300">Etiquette first, always.</div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="text-sm font-semibold text-white">Discipline</div>
              <div className="text-xs text-zinc-300">Small steps every day.</div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="text-sm font-semibold text-white">Spirit</div>
              <div className="text-xs text-zinc-300">Show up and give your best.</div>
            </GlassCard>
          </div>
        </div>

        <div className="lg:justify-self-end">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="mb-3 text-center text-sm font-semibold text-zinc-200">
              Home carousel
            </div>
            <Carousel />
            <div className="mt-2 text-center text-xs text-zinc-400">
              Admins can upload/delete images. Everyone can view.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard>
          <div className="text-sm font-semibold text-white">Blog</div>
          <div className="mt-2 text-sm text-zinc-300">
            Share training notes, announcements, and dojo news.
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold text-white">Events</div>
          <div className="mt-2 text-sm text-zinc-300">
            Track tournaments, gradings, seminars, and schedules.
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold text-white">Gallery</div>
          <div className="mt-2 text-sm text-zinc-300">
            Highlight moments from training and competitions.
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

