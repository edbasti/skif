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
import { useEffect, useMemo, useState } from 'react'
import { GlassCard } from '../../components/GlassCard.jsx'
import { db } from '../../firebase/firebase.js'

function MoneyInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="decimal"
      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      placeholder="0.00"
    />
  )
}

export function FundsPage() {
  const [funds, setFunds] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'funds'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setFunds(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  const total = useMemo(() => {
    return funds.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
  }, [funds])

  function resetForm() {
    setTitle('')
    setAmount('')
    setDescription('')
    setEditing(null)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      setBusy(true)
      const payload = {
        title: title.trim(),
        amount: Number(amount) || 0,
        description: description.trim(),
        updatedAt: serverTimestamp(),
      }
      if (!payload.title) throw new Error('Title is required.')

      if (editing?.id) {
        await updateDoc(doc(db, 'funds', editing.id), payload)
      } else {
        await addDoc(collection(db, 'funds'), { ...payload, createdAt: serverTimestamp() })
      }
      resetForm()
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function onEdit(f) {
    setEditing(f)
    setTitle(f.title ?? '')
    setAmount(String(f.amount ?? ''))
    setDescription(f.description ?? '')
  }

  async function onDelete(f) {
    if (!f?.id) return
    setError('')
    try {
      setBusy(true)
      await deleteDoc(doc(db, 'funds', f.id))
      if (editing?.id === f.id) resetForm()
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Fund Management</h2>
          <p className="mt-1 text-zinc-600">CRUD for dojo funds.</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-zinc-700">
          Total: <span className="font-semibold text-blue-700">{total.toFixed(2)}</span>
        </div>
      </div>

      <GlassCard>
        <div className="text-sm font-semibold text-zinc-900">
          {editing ? 'Edit fund' : 'Add new fund'}
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 md:col-span-1">
            <span className="text-xs text-zinc-600">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Membership fees"
            />
          </label>

          <label className="grid gap-1 md:col-span-1">
            <span className="text-xs text-zinc-600">Amount</span>
            <MoneyInput value={amount} onChange={setAmount} />
          </label>

          <label className="grid gap-1 md:col-span-1">
            <span className="text-xs text-zinc-600">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Notes…"
            />
          </label>

          {error && (
            <div className="md:col-span-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 md:col-span-3">
            <button
              disabled={busy}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? 'Working…' : editing ? 'Save changes' : 'Create fund'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="text-sm font-semibold text-zinc-900">Funds</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              {funds.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-500">
                    No funds yet.
                  </td>
                </tr>
              ) : (
                funds.map((f) => (
                  <tr key={f.id} className="border-t border-zinc-200">
                    <td className="py-3 pr-4 font-semibold text-zinc-900">{f.title}</td>
                    <td className="py-3 pr-4">{Number(f.amount || 0).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-zinc-600">{f.description}</td>
                    <td className="py-3 pr-0">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(f)}
                          className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(f)}
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

