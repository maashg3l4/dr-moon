import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'

async function isDoctorEmail(email) {
  if (!firestore || !email) return false
  const emailValue = email.toLowerCase()
  const doctorsRef = collection(firestore, 'doctors')
  const doctorQuery = query(doctorsRef, where('email', '==', emailValue))
  const snapshot = await getDocs(doctorQuery)
  return !snapshot.empty
}

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!auth) {
      setStatus('unauthenticated')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        setStatus('unauthenticated')
        return
      }

      const validDoctor = await isDoctorEmail(user.email)
      if (!validDoctor) {
        await signOut(auth)
        setStatus('unauthenticated')
        return
      }

      setStatus('authenticated')
    })

    return unsubscribe
  }, [])

  if (status === 'loading') {
    return <div className="rounded-[2rem] bg-white p-8 text-center shadow-lg shadow-slate-200/50">Loading doctor access...</div>
  }

  if (status !== 'authenticated') {
    return <Navigate to="/doctor/login" replace />
  }

  return children
}
