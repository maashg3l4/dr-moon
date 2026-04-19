import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'

async function findDoctorByEmail(email) {
  if (!firestore || !email) return null
  const doctorsRef = collection(firestore, 'doctors')
  const search = query(doctorsRef, where('email', '==', email.toLowerCase()))
  const snapshot = await getDocs(search)
  if (snapshot.empty) return null
  const doc = snapshot.docs[0]
  return { id: doc.id, ...doc.data() }
}

export default function DoctorLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return
      const doctor = await findDoctorByEmail(user.email)
      if (doctor) {
        setIsAuthenticated(true)
        navigate('/doctor', { replace: true })
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
      const doctor = await findDoctorByEmail(credential.user.email)
      if (!doctor) {
        await signOut(auth)
        setError('Access denied. Only doctors can log in here.')
        setLoading(false)
        return
      }
      navigate('/doctor', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Login failed. Please check your email/password.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 rounded-3xl bg-sky-50 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-sky-700">ডাক্তার অ্যাক্সেস</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Doctor Login</h1>
        <p className="mt-3 text-slate-600">Use your doctor email and password to access the private dashboard.</p>
      </div>
      <div className="mb-6 grid gap-3 rounded-3xl border border-sky-100 bg-white p-5 text-sm text-slate-700 shadow-sm sm:grid-cols-3">
        <div className="rounded-3xl bg-sky-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Step 1</p>
          <p className="mt-3 font-semibold">Login to Doctor Panel</p>
          <p className="mt-2 text-slate-600">Enter your doctor account credentials.</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Step 2</p>
          <p className="mt-3 font-semibold">Manage Appointments</p>
          <p className="mt-2 text-slate-600">See today’s patients, serial and prescriptions.</p>
        </div>
        <div className="rounded-3xl bg-sky-50 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">Step 3</p>
          <p className="mt-3 font-semibold">Complete Consultations</p>
          <p className="mt-2 text-slate-600">Update serial, send prescriptions and confirm visits.</p>
        </div>
      </div>

      {error && <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text" htmlFor="doctor-email">Email</label>
          <input
            id="doctor-email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="doctor@example.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="doctor-password">Password</label>
          <input
            id="doctor-password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Enter password"
            className="input-field"
          />
        </div>

        <button type="submit" className="primary-action w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login as Doctor'}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/doctor/signup" className="font-semibold text-sky-700 hover:underline">
          Create doctor account
        </Link>
      </p>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Doctor setup note:</p>
        <p className="mt-2">Make sure the doctor's email exists in the Firestore <code>doctors</code> collection.</p>
      </div>
    </div>
  )
}
