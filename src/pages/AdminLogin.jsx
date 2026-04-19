import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'

async function isAdminEmail(email) {
  if (!firestore || !email) return false
  const emailValue = email.toLowerCase()
  const adminsRef = collection(firestore, 'admins')
  const adminQuery = query(adminsRef, where('email', '==', emailValue))
  const snapshot = await getDocs(adminQuery)
  return !snapshot.empty
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return
      const isAdmin = await isAdminEmail(user.email)
      if (isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        await signOut(auth)
      }
    })
    return unsubscribe
  }, [navigate])

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    if (!auth || !firestore) {
      setError('Firebase is not configured properly yet.')
      return
    }

    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const isAdmin = await isAdminEmail(credential.user.email)
      if (!isAdmin) {
        await signOut(auth)
        setError('Access denied. Only admins can log in here.')
        setLoading(false)
        return
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Login failed. Please check your email/password.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 rounded-3xl bg-purple-50 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-700">অ্যাডমিন অ্যাক্সেস</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-3 text-slate-600">Use your admin email and password to access the admin dashboard.</p>
      </div>
      <div className="mb-6 grid gap-3 rounded-3xl border border-purple-100 bg-white p-5 text-sm text-slate-700 shadow-sm sm:grid-cols-3">
        <div className="rounded-3xl bg-purple-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-700">Step 1</p>
          <p className="mt-3 font-semibold">Login as Admin</p>
          <p className="mt-2 text-slate-600">Enter your admin email and password.</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-700">Step 2</p>
          <p className="mt-3 font-semibold">View Dashboard</p>
          <p className="mt-2 text-slate-600">Manage doctors, appointments and system settings.</p>
        </div>
        <div className="rounded-3xl bg-purple-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-700">Step 3</p>
          <p className="mt-3 font-semibold">Finish Actions</p>
          <p className="mt-2 text-slate-600">Update status, approve payments and keep records.</p>
        </div>
      </div>

      {error && <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text" htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="admin@example.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Enter password"
            className="input-field"
          />
        </div>

        <button type="submit" className="primary-action w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login as Admin'}
        </button>
      </form>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Admin setup note:</p>
        <p className="mt-2">Make sure the admin email exists in the Firestore <code>admins</code> collection.</p>
      </div>
    </div>
  )
}