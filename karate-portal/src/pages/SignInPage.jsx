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
        if (role === 'admin') {
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          const savedRole = snap.exists() ? (snap.data()?.role ?? 'player') : 'player'
          if (savedRole !== 'admin') {
            await signOut(auth)
            throw new Error(
              'This account is not an admin. Set users/{uid}.role to "admin" in Firestore, or create the admin via /setup.',
            )
          }
        } else {
          // Ensure doc exists for players, without overwriting role.
          await ensureUserDoc(cred.user.uid)
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
        <h2 className="text-2xl font-bold text-zinc-900">{title}</h2>
        <p className="mt-1 text-zinc-600">
          Two options: <span className="font-semibold text-blue-700">admin</span> and{' '}
          <span className="font-semibold text-blue-700">player</span>.
        </p>
      </div>

      <GlassCard>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('signin')}
            type="button"
            className={[
              'flex-1 rounded-xl px-3 py-2 text-sm font-semibold',
              mode === 'signin'
                ? 'bg-blue-600 text-white'
                : 'border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
            ].join(' ')}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('signup')}
            type="button"
            className={[
              'flex-1 rounded-xl px-3 py-2 text-sm font-semibold',
              mode === 'signup'
                ? 'bg-blue-600 text-white'
                : 'border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
            ].join(' ')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {mode === 'signin' ? 'Sign in as' : 'Account type'}
            </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={[
                    'rounded-xl px-3 py-2 text-sm font-semibold',
                    role === 'player'
                      ? 'bg-blue-600 text-white'
                      : 'border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
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
                      ? 'bg-blue-600 text-white'
                      : 'border border-zinc-300 bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
                  ].join(' ')}
                >
                  Admin
                </button>
              </div>
              {mode === 'signup' && role === 'admin' && (
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-600">Admin invite code</span>
                  <input
                    value={invite}
                    onChange={(e) => setInvite(e.target.value)}
                    className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter invite code"
                  />
                </label>
              )}
          </div>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            disabled={busy}
            className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? 'Working…' : title}
          </button>

          <div className="text-center text-xs text-zinc-500">
            <Link className="text-blue-600 underline hover:text-blue-700" to="/">
              Back to home
            </Link>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}

