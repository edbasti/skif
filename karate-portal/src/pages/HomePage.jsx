import { Carousel } from '../components/Carousel.jsx'
import { GlassCard } from '../components/GlassCard.jsx'

export function HomePage() {
  return (
    <div className="space-y-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
            Our DOJO
            <span className="h-1 w-1 rounded-full bg-yellow-500" />
            Training • Community • Events
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            Walk the path.
            <span className="block text-red-600">
              Train with purpose.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-zinc-600">
            A simple home for your dojo: announcements, events, a gallery, and player
            profiles—plus admin tools for fund management.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <GlassCard className="p-4 border-blue-100 bg-blue-50/50">
              <div className="text-sm font-semibold text-blue-800">Respect</div>
              <div className="text-xs text-zinc-600">Etiquette first, always.</div>
            </GlassCard>
            <GlassCard className="p-4 border-red-100 bg-red-50/50">
              <div className="text-sm font-semibold text-red-800">Discipline</div>
              <div className="text-xs text-zinc-600">Small steps every day.</div>
            </GlassCard>
            <GlassCard className="p-4 border-yellow-100 bg-yellow-50/50">
              <div className="text-sm font-semibold text-yellow-800">Spirit</div>
              <div className="text-xs text-zinc-600">Show up and give your best.</div>
            </GlassCard>
          </div>
        </div>

        <div className="lg:justify-self-end">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="mb-3 text-center text-sm font-semibold text-zinc-700">
              Home carousel
            </div>
            <Carousel />
            <div className="mt-2 text-center text-xs text-zinc-500">
              Admins can upload images/videos or add embed URLs. Everyone can view.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard>
          <div className="text-sm font-semibold text-blue-700">Blog</div>
          <div className="mt-2 text-sm text-zinc-600">
            Share training notes, announcements, and dojo news.
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold text-red-700">Events</div>
          <div className="mt-2 text-sm text-zinc-600">
            Track tournaments, gradings, seminars, and schedules.
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm font-semibold text-yellow-700">Gallery</div>
          <div className="mt-2 text-sm text-zinc-600">
            Highlight moments from training and competitions.
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

