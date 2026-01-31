import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from '../components/GlassCard.jsx'
import { auth, db } from '../firebase/firebase.js'
import { createSecondaryAuth } from '../firebase/secondaryAuth.js'

const SETUP_SECRET = import.meta.env.VITE_SETUP_SECRET

export function SetupPage() {
  const [secret, setSecret] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [playerEmail, setPlayerEmail] = useState('')
  const [playerPassword, setPlayerPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const canRun = useMemo(() => {
    if (!SETUP_SECRET) return false
    return secret === SETUP_SECRET
  }, [secret])

  async function createAccount(email, password, role) {
    const secondaryAuth = createSecondaryAuth()
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)

    // Sign in on main app so Firestore rules allow writing users/{uid}
    await signInWithEmailAndPassword(auth, email, password)
    await setDoc(
      doc(db, 'users', cred.user.uid),
      {
        uid: cred.user.uid,
        email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    await signOut(auth)

    return { uid: cred.user.uid, email, role }
  }

  async function onSeed(e) {
    e.preventDefault()
    setError('')
    setResult(null)

    try {
      setBusy(true)
      if (!SETUP_SECRET) throw new Error('Missing VITE_SETUP_SECRET in .env')
      if (secret !== SETUP_SECRET) throw new Error('Invalid setup secret.')
      if (!adminEmail || !adminPassword) throw new Error('Admin email/password required.')
      if (!playerEmail || !playerPassword) throw new Error('Player email/password required.')

      const admin = await createAccount(adminEmail, adminPassword, 'admin')
      const player = await createAccount(playerEmail, playerPassword, 'player')

      setResult({ admin, player })
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Initialize / Seed Accounts</h2>
        <p className="mt-1 text-zinc-300">
          Creates one <span className="font-semibold text-white">admin</span> and one{' '}
          <span className="font-semibold text-white">player</span> user in Firebase Auth and
          saves roles in Firestore.
        </p>
      </div>

      {!SETUP_SECRET && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          Add <code className="font-mono">VITE_SETUP_SECRET</code> to your <code className="font-mono">.env</code>{' '}
          to enable this page.
        </div>
      )}

      <GlassCard>
        <form onSubmit={onSeed} className="space-y-5">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Setup secret</span>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Enter VITE_SETUP_SECRET"
            />
            <div className="text-xs text-zinc-400">
              This prevents anyone from seeding accounts without your secret.
            </div>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Admin credentials</div>
              <div className="mt-3 grid gap-3">
                <input
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  type="email"
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  placeholder="admin@example.com"
                />
                <input
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  type="password"
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  placeholder="Admin password"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold text-white">Player credentials</div>
              <div className="mt-3 grid gap-3">
                <input
                  value={playerEmail}
                  onChange={(e) => setPlayerEmail(e.target.value)}
                  type="email"
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  placeholder="player@example.com"
                />
                <input
                  value={playerPassword}
                  onChange={(e) => setPlayerPassword(e.target.value)}
                  type="password"
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  placeholder="Player password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              Seed complete.
              <pre className="mt-2 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-zinc-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || !canRun}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60"
            >
              {busy ? 'Working…' : 'Create admin + player'}
            </button>
            <Link
              to="/signin"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Go to Sign in
            </Link>
          </div>

          <div className="text-xs text-zinc-400">
            If an email already exists, Firebase will return an error. Use Sign In instead.
          </div>
        </form>
      </GlassCard>
    </div>
  )
}

