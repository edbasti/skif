import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useMemo, useRef, useState } from 'react'
import { db, storage } from '../firebase/firebase.js'
import { useAuth } from '../auth/AuthProvider.jsx'

export function Carousel() {
  const { isAdmin, user } = useAuth()
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, 'carouselImages'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setItems(rows)
      setIdx(0)
    })
    return () => unsub()
  }, [])

  const active = items[idx] ?? null
  const isVideo = active?.type === 'video'
  const isIframe = active?.type === 'iframe'

  const [showEmbed, setShowEmbed] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  const canRotate = items.length > 1
  const next = () => setIdx((i) => (items.length ? (i + 1) % items.length : 0))
  const prev = () =>
    setIdx((i) => (items.length ? (i - 1 + items.length) % items.length : 0))

  useEffect(() => {
    if (!canRotate) return
    timerRef.current = setInterval(() => next(), 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRotate, items.length])

  const dots = useMemo(
    () =>
      items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => setIdx(i)}
          className={[
            'h-2.5 w-2.5 rounded-full transition',
            i === idx ? 'bg-blue-600' : 'bg-white/70 hover:bg-white',
          ].join(' ')}
          aria-label={`Go to slide ${i + 1}`}
        />
      )),
    [items, idx],
  )

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const type = file.type.startsWith('video/') ? 'video' : 'image'
    try {
      setBusy(true)
      const path = `carousel/${user.uid}/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await addDoc(collection(db, 'carouselImages'), {
        url,
        storagePath: path,
        type,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      })
      e.target.value = ''
    } finally {
      setBusy(false)
    }
  }

  function parseEmbedInput(input) {
    const trimmed = input.trim()
    if (!trimmed) return null
    // If pasted full iframe HTML, extract src
    if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
      const match = trimmed.match(/src=["']([^"']+)["']/)
      return match ? match[1] : null
    }
    return trimmed
  }

  async function onAddEmbed(e) {
    e.preventDefault()
    const url = parseEmbedInput(embedUrl)
    if (!url) return
    try {
      setBusy(true)
      await addDoc(collection(db, 'carouselImages'), {
        url,
        type: 'iframe',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      })
      setEmbedUrl('')
      setShowEmbed(false)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(item) {
    if (!isAdmin) return
    if (!item?.id) return
    try {
      setBusy(true)
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath))
      }
      await deleteDoc(doc(db, 'carouselImages', item.id))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg">
      <div className="aspect-[16/7] w-full bg-zinc-100">
        {active?.url ? (
          isIframe ? (
            <iframe
              key={active.id}
              src={active.url}
              title="Carousel embed"
              className="h-full w-full border-0"
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isVideo ? (
            <video
              key={active.id}
              src={active.url}
              className="h-full w-full object-cover"
              controls
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={active.url}
              alt="Carousel"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )
        ) : (
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-zinc-800">Add your dojo moments</div>
              <div className="mt-1 text-sm text-zinc-500">
                Upload images or videos, or add an embed URL (e.g. YouTube).
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="flex items-center gap-2">{dots}</div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={!canRotate}
            className="rounded-lg border border-white/20 bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={next}
            disabled={!canRotate}
            className="rounded-lg border border-white/20 bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30 disabled:opacity-40"
          >
            Next
          </button>

          {isAdmin && (
            <>
              <label className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {busy ? 'Working…' : 'Upload'}
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={onUpload}
                  disabled={busy}
                />
              </label>
              {showEmbed ? (
                <form onSubmit={onAddEmbed} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    placeholder="Paste URL or full iframe code (e.g. Facebook)"
                    className="min-w-[140px] rounded-lg border border-white/20 bg-white/20 px-2 py-1.5 text-sm text-white placeholder:text-white/70 outline-none focus:ring-1 focus:ring-white"
                    disabled={busy}
                  />
                  <button
                    type="submit"
                    disabled={busy || !parseEmbedInput(embedUrl)}
                    className="rounded-lg bg-white/20 px-2 py-1.5 text-sm font-medium text-white hover:bg-white/30 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEmbed(false); setEmbedUrl('') }}
                    className="rounded-lg px-2 py-1.5 text-sm text-white/90 hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEmbed(true)}
                  className="rounded-lg border border-white/20 bg-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/30"
                >
                  Embed
                </button>
              )}
              {active?.id && (
                <button
                  onClick={() => onDelete(active)}
                  disabled={busy}
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

