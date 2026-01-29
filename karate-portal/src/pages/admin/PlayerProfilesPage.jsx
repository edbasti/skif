import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { GlassCard } from '../../components/GlassCard.jsx'
import { db } from '../../firebase/firebase.js'

const emptyForm = {
  name: '',
  belt: '',
  dojo: '',
  age: '',
  weightClass: '',
  bio: '',
}

export function PlayerProfilesPage() {
  const [players, setPlayers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function reset() {
    setForm(emptyForm)
    setEditing(null)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      setBusy(true)
      const payload = {
        name: form.name.trim(),
        belt: form.belt.trim(),
        dojo: form.dojo.trim(),
        age: form.age ? Number(form.age) : null,
        weightClass: form.weightClass.trim(),
        bio: form.bio.trim(),
        updatedAt: serverTimestamp(),
      }
      if (!payload.name) throw new Error('Player name is required.')

      if (editing?.id) {
        await updateDoc(doc(db, 'players', editing.id), payload)
      } else {
        await addDoc(collection(db, 'players'), { ...payload, createdAt: serverTimestamp() })
      }
      reset()
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  function onEdit(p) {
    setEditing(p)
    setForm({
      name: p.name ?? '',
      belt: p.belt ?? '',
      dojo: p.dojo ?? '',
      age: p.age ?? '',
      weightClass: p.weightClass ?? '',
      bio: p.bio ?? '',
    })
  }

  async function onDelete(p) {
    if (!p?.id) return
    setError('')
    try {
      setBusy(true)
      await deleteDoc(doc(db, 'players', p.id))
      if (editing?.id === p.id) reset()
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Player Profiles</h2>
        <p className="mt-1 text-zinc-300">CRUD for karate players.</p>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold text-white">
          {editing ? 'Edit player' : 'Add new player'}
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Name</span>
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Hikaru Tanaka"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Belt</span>
            <input
              value={form.belt}
              onChange={(e) => setField('belt', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Brown belt"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Dojo</span>
            <input
              value={form.dojo}
              onChange={(e) => setField('dojo', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Seishin Dojo"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Age</span>
            <input
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
              inputMode="numeric"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="18"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Weight class</span>
            <input
              value={form.weightClass}
              onChange={(e) => setField('weightClass', e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="-67 kg"
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs text-zinc-300">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setField('bio', e.target.value)}
              rows={4}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              placeholder="Short background, achievements, goals…"
            />
          </label>

          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              disabled={busy}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60"
            >
              {busy ? 'Working…' : editing ? 'Save changes' : 'Create player'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold text-white">Players</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Belt</th>
                <th className="py-2 pr-4">Dojo</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Weight</th>
                <th className="py-2 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-zinc-200">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-400">
                    No players yet.
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className="py-3 pr-4 font-semibold text-white">{p.name}</td>
                    <td className="py-3 pr-4 text-zinc-300">{p.belt}</td>
                    <td className="py-3 pr-4 text-zinc-300">{p.dojo}</td>
                    <td className="py-3 pr-4 text-zinc-300">{p.age ?? '—'}</td>
                    <td className="py-3 pr-4 text-zinc-300">{p.weightClass ?? '—'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          disabled={busy}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-100 hover:bg-red-500/15 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

