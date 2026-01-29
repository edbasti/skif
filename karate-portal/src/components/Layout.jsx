import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/firebase.js'
import { useAuth } from '../auth/AuthProvider.jsx'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-zinc-200 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function Layout() {
  const { isAuthed, isAdmin, user, loading } = useAuth()
  const navigate = useNavigate()

  async function onSignOut() {
    await signOut(auth)
    navigate('/')
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-amber-400 text-lg font-black text-zinc-950">
              道
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">SKIF Bataan</div>
              <div className="text-xs text-zinc-400">Discipline • Respect • Growth</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/blog">Blog</NavItem>
            <NavItem to="/events">Events</NavItem>
            <NavItem to="/gallery">Gallery</NavItem>
            {isAuthed && <NavItem to="/me">My Profile</NavItem>}
            {isAdmin && (
              <>
                <NavItem to="/admin/funds">Fund Management</NavItem>
                <NavItem to="/admin/players">Player Profiles</NavItem>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="text-xs text-zinc-400">Loading…</div>
            ) : isAuthed ? (
              <>
                <div className="hidden text-xs text-zinc-400 sm:block">
                  {user?.email} {isAdmin ? '(admin)' : '(player)'}
                </div>
                <button
                  onClick={onSignOut}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-zinc-400">
          © {new Date().getFullYear()} SKIF Bataan. Built with Vite + React + Firebase.
        </div>
      </footer>
    </div>
  )
}
