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
        <h2 className="text-2xl font-bold text-zinc-900">Player Profiles</h2>
        <p className="mt-1 text-zinc-600">CRUD for karate players.</p>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold text-zinc-900">
          {editing ? 'Edit player' : 'Add new player'}
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Name</span>
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Hikaru Tanaka"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Belt</span>
            <input
              value={form.belt}
              onChange={(e) => setField('belt', e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Brown belt"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Dojo</span>
            <input
              value={form.dojo}
              onChange={(e) => setField('dojo', e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Seishin Dojo"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Age</span>
            <input
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
              inputMode="numeric"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="18"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-zinc-600">Weight class</span>
            <input
              value={form.weightClass}
              onChange={(e) => setField('weightClass', e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="-67 kg"
            />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs text-zinc-600">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setField('bio', e.target.value)}
              rows={4}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Short background, achievements, goals…"
            />
          </label>

          {error && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              disabled={busy}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? 'Working…' : editing ? 'Save changes' : 'Create player'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold text-zinc-900">Players</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Belt</th>
                <th className="py-2 pr-4">Dojo</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Weight</th>
                <th className="py-2 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              {players.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-500">
                    No players yet.
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p.id} className="border-t border-zinc-200">
                    <td className="py-3 pr-4 font-semibold text-zinc-900">{p.name}</td>
                    <td className="py-3 pr-4 text-zinc-600">{p.belt}</td>
                    <td className="py-3 pr-4 text-zinc-600">{p.dojo}</td>
                    <td className="py-3 pr-4 text-zinc-600">{p.age ?? '—'}</td>
                    <td className="py-3 pr-4 text-zinc-600">{p.weightClass ?? '—'}</td>
                    <td className="py-3 pr-0">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(p)}
                          className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          disabled={busy}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
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

