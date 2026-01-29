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
  const [images, setImages] = useState([])
  const [idx, setIdx] = useState(0)
  const [busy, setBusy] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, 'carouselImages'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setImages(rows)
      setIdx(0)
    })
    return () => unsub()
  }, [])

  const active = images[idx] ?? null

  const canRotate = images.length > 1
  const next = () => setIdx((i) => (images.length ? (i + 1) % images.length : 0))
  const prev = () =>
    setIdx((i) => (images.length ? (i - 1 + images.length) % images.length : 0))

  useEffect(() => {
    if (!canRotate) return
    timerRef.current = setInterval(() => next(), 5000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRotate, images.length])

  const dots = useMemo(
    () =>
      images.map((img, i) => (
        <button
          key={img.id}
          onClick={() => setIdx(i)}
          className={[
            'h-2.5 w-2.5 rounded-full transition',
            i === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/60',
          ].join(' ')}
          aria-label={`Go to slide ${i + 1}`}
        />
      )),
    [images, idx],
  )

  async function onUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setBusy(true)
      const path = `carousel/${user.uid}/${Date.now()}-${file.name}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await addDoc(collection(db, 'carouselImages'), {
        url,
        storagePath: path,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      })
      e.target.value = ''
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(img) {
    if (!isAdmin) return
    if (!img?.id) return
    try {
      setBusy(true)
      if (img.storagePath) {
        await deleteObject(ref(storage, img.storagePath))
      }
      await deleteDoc(doc(db, 'carouselImages', img.id))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 shadow-xl">
      <div className="aspect-[16/7] w-full bg-zinc-900/40">
        {active?.url ? (
          <img
            src={active.url}
            alt="Carousel"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">Add your dojo moments</div>
              <div className="mt-1 text-sm text-zinc-300">
                Upload images to show on the home carousel.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center gap-2">{dots}</div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={!canRotate}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={next}
            disabled={!canRotate}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-40"
          >
            Next
          </button>

          {isAdmin && (
            <>
              <label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
                {busy ? 'Working…' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUpload}
                  disabled={busy}
                />
              </label>
              {active?.id && (
                <button
                  onClick={() => onDelete(active)}
                  disabled={busy}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100 hover:bg-red-500/15 disabled:opacity-40"
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

