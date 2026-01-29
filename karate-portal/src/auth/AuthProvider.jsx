/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth, db } from '../firebase/firebase.js'

const AuthContext = createContext(null)

async function ensureUserDoc(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) return snap.data()

  const data = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? null,
    role: 'player',
    createdAt: serverTimestamp(),
  }
  await setDoc(userRef, data, { merge: true })
  return data
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true)
        setUser(firebaseUser)
        if (!firebaseUser) {
          setProfile(null)
          return
        }
        const data = await ensureUserDoc(firebaseUser)
        setProfile(data)
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const value = useMemo(() => {
    const role = profile?.role ?? null
    return {
      loading,
      user,
      profile,
      role,
      isAuthed: !!user,
      isAdmin: role === 'admin',
    }
  }, [loading, user, profile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
