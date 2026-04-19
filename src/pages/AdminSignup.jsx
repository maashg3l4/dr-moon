import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'

const ADMIN_SIGNUP_CODE = import.meta.env.VITE_ADMIN_SIGNUP_CODE || 'admin-secret'

export default function AdminSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim() || !inviteCode.trim()) {
      setError('Please fill in every field.')
      return
    }

    if (inviteCode.trim() !== ADMIN_SIGNUP_CODE) {
      setError('Invalid admin signup code.')
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
      const adminsRef = collection(firestore, 'admins')
      await addDoc(adminsRef, {
        email: credential.user.email.toLowerCase(),
        name: name.trim(),
        createdAt: new Date(),
      })
      navigate('/admin/login', { replace: true })
    } catch (err) {
      console.error('Admin signup error:', err)
      setError('Unable to create admin account. Please use another email or try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 rounded-3xl bg-purple-50 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-700">অ্যাডমিন নিবন্ধন</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Admin Signup</h1>
        <p className="mt-3 text-slate-600">Create your admin account with your Gmail address.</p>
      </div>

      {error && <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-text" htmlFor="admin-name">Name</label>
          <input
            id="admin-name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Admin Name"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="admin-signup-email">Email</label>
          <input
            id="admin-signup-email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="admin@gmail.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="admin-signup-password">Password</label>
          <input
            id="admin-signup-password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Create a password"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text" htmlFor="admin-invite-code">Admin Signup Code</label>
          <input
            id="admin-invite-code"
            type="text"
            value={inviteCode}
            onChange={event => setInviteCode(event.target.value)}
            placeholder="Enter admin signup code"
            className="input-field"
          />
        </div>

        <button type="submit" className="primary-action w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Admin Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/admin/login" className="font-semibold text-purple-700 hover:underline">
          Login here
        </Link>
      </p>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Admin security note:</p>
        <p className="mt-2">Only users with the correct admin signup code can register as admin.</p>
      </div>
    </div>
  )
}
