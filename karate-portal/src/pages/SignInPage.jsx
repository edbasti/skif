import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase/firebase.js'
import { GlassCard } from '../components/GlassCard.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

const ADMIN_INVITE_CODE = import.meta.env.VITE_ADMIN_INVITE_CODE

export function SignInPage() {
  const { isAuthed } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('signin') // signin | signup
  const [role, setRole] = useState('player') // player | admin (only for signup)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invite, setInvite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const title = useMemo(() => (mode === 'signin' ? 'Sign in' : 'Create account'), [mode])

  useEffect(() => {
    if (!isAuthed) return
    navigate('/me', { replace: true })
  }, [isAuthed, navigate])

  async function ensureUserDoc(uid) {
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  async function upsertRole(uid, selectedRole) {
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email,
        role: selectedRole,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      setBusy(true)
      if (mode === 'signin') {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        // Ensure doc exists, without overwriting role.
        await ensureUserDoc(cred.user.uid)
        if (role === 'admin') {
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          const savedRole = snap.data()?.role ?? 'player'
          if (savedRole !== 'admin') {
            await signOut(auth)
            throw new Error('This account is not an admin.')
          }
        }
        navigate('/me')
        return
      }

      // signup
      if (role === 'admin') {
        if (!ADMIN_INVITE_CODE) {
          throw new Error('Admin sign-up is not enabled (missing VITE_ADMIN_INVITE_CODE).')
        }
        if (invite !== ADMIN_INVITE_CODE) {
          throw new Error('Invalid admin invite code.')
        }
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await upsertRole(cred.user.uid, role)
      navigate('/me')
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-zinc-300">
          Two options: <span className="font-semibold text-white">admin</span> and{' '}
          <span className="font-semibold text-white">player</span>.
        </p>
      </div>

      <GlassCard>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('signin')}
            className={[
              'flex-1 rounded-xl px-3 py-2 text-sm font-semibold',
              mode === 'signin'
                ? 'bg-white text-zinc-950'
                : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
            ].join(' ')}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={[
              'flex-1 rounded-xl px-3 py-2 text-sm font-semibold',
              mode === 'signup'
                ? 'bg-white text-zinc-950'
                : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
            ].join(' ')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-2">
            <div className="text-xs uppercase tracking-wide text-zinc-400">
              {mode === 'signin' ? 'Sign in as' : 'Account type'}
            </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold',
                    role === 'player'
                      ? 'bg-white text-zinc-950'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
                  ].join(' ')}
                >
                  Player
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold',
                    role === 'admin'
                      ? 'bg-white text-zinc-950'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
                  ].join(' ')}
                >
                  Admin
                </button>
              </div>
              {mode === 'signup' && role === 'admin' && (
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-300">Admin invite code</span>
                  <input
                    value={invite}
                    onChange={(e) => setInvite(e.target.value)}
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    placeholder="Enter invite code"
                  />
                </label>
              )}
          </div>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60"
          >
            {busy ? 'Working…' : title}
          </button>

          <div className="text-center text-xs text-zinc-400">
            <Link className="underline hover:text-zinc-200" to="/">
              Back to home
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}

