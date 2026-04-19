import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'

export default function DoctorSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please complete all fields.')
      return
    }

    if (!auth || !firestore) {
      setError('Firebase is not configured.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const doctorsRef = collection(firestore, 'doctors')
      await addDoc(doctorsRef, {
        email: credential.user.email.toLowerCase(),
        name: name.trim(),
        createdAt: new Date(),
      })
      navigate('/doctor/login', { replace: true })
    } catch (err) {
      console.error('Doctor signup error:', err)
      setError('Unable to create doctor account. Please use another email or try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 rounded-3xl bg-sky-50 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-sky-700">ডাক্তার নিবন্ধন</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Doctor Signup</h1>
        <p className="mt-3 text-slate-600">Create your doctor account using your personal email.</p>
      </div>

      {error && <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text" htmlFor="doctor-name">Name</label>
          <input
            id="doctor-name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Dr. Full Name"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="doctor-signup-email">Email</label>
          <input
            id="doctor-signup-email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="doctor@gmail.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="doctor-signup-password">Password</label>
          <input
            id="doctor-signup-password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Create a password"
            className="input-field"
          />
        </div>

        <button type="submit" className="primary-action w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Doctor Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/doctor/login" className="font-semibold text-sky-700 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  )
}
