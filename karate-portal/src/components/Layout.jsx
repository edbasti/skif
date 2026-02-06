import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/firebase.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import skifLogo from '../assets/skif-logo.jpeg'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-md px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
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
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={skifLogo}
              alt="SKIF Bataan"
              className="h-9 w-auto rounded-xl object-contain shadow-md"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-900">SKIF Bataan</div>
              <div className="text-xs text-zinc-500">Discipline • Respect • Growth</div>
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
              <div className="text-xs text-zinc-500">Loading…</div>
            ) : isAuthed ? (
              <>
                <div className="hidden text-xs text-zinc-500 sm:block">
                  {user?.email} {isAdmin ? '(admin)' : '(player)'}
                </div>
                <button
                  onClick={onSignOut}
                  className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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

      <footer className="border-t border-zinc-200 bg-zinc-50 py-10">
        <div className="mx-auto max-w-6xl px-4 text-sm text-zinc-500">
          © {new Date().getFullYear()} SKIF Bataan. Built with Vite + React + Firebase.
        </div>
      </footer>
    </div>
  )
}
