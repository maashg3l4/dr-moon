import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, firestore } from '../firebaseConfig'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore'
import { FaArrowRight, FaEye, FaSignOutAlt, FaUserMd, FaUser, FaTrash, FaEdit, FaPlus } from 'react-icons/fa'

async function isAdminEmail(email) {
  if (!firestore || !email) return false
  const emailValue = email.toLowerCase()
  const adminsRef = collection(firestore, 'admins')
  const adminQuery = query(adminsRef, where('email', '==', emailValue))
  const snapshot = await getDocs(adminQuery)
  return !snapshot.empty
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('appointments')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [message, setMessage] = useState('')
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [newDoctor, setNewDoctor] = useState({ name: '', email: '', specialty: '', fee: '', schedule: '' })

  const navigate = useNavigate()

  useEffect(() => {
    // Bypass authentication for demo mode
    if (!auth) {
      // Load demo data directly
      setLoading(true)
      const loadDemoData = async () => {
        try {
          const localAppointments = []
          const localDoctors = [
            { id: '1', name: 'Dr. Tasdikhul Islam Moon', email: 'doctor@dr-moon.com', specialty: 'General Medicine', fee: '400', schedule: 'Mon-Fri 9AM-5PM' }
          ]

          for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i)
            if (key.startsWith('appointment_')) {
              const data = JSON.parse(localStorage.getItem(key))
              localAppointments.push({ id: key.replace('appointment_', ''), ...data })
            }
          }

          setAppointments(localAppointments)
          setDoctors(localDoctors)
          setIsAdmin(true)
        } catch (error) {
          console.error('Error loading demo data:', error)
        } finally {
          setLoading(false)
        }
      }
      loadDemoData()
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) {
        // For demo mode, don't redirect to login
        setLoading(true)
        const loadDemoData = async () => {
          try {
            const localAppointments = []
            const localDoctors = [
              { id: '1', name: 'Dr. Tasdikhul Islam Moon', email: 'doctor@dr-moon.com', specialty: 'General Medicine', fee: '400', schedule: 'Mon-Fri 9AM-5PM' }
            ]

            for (let i = 0; i < localStorage.length; i += 1) {
              const key = localStorage.key(i)
              if (key.startsWith('appointment_')) {
                const data = JSON.parse(localStorage.getItem(key))
                localAppointments.push({ id: key.replace('appointment_', ''), ...data })
              }
            }

            setAppointments(localAppointments)
            setDoctors(localDoctors)
            setIsAdmin(true)
          } catch (error) {
            console.error('Error loading demo data:', error)
          } finally {
            setLoading(false)
          }
        }
        loadDemoData()
        return
      }

      const adminCheck = await isAdminEmail(user.email)
      if (!adminCheck) {
        // For demo mode, don't sign out or redirect
        setLoading(true)
        const loadDemoData = async () => {
          try {
            const localAppointments = []
            const localDoctors = [
              { id: '1', name: 'Dr. Tasdikhul Islam Moon', email: 'doctor@dr-moon.com', specialty: 'General Medicine', fee: '400', schedule: 'Mon-Fri 9AM-5PM' }
            ]

            for (let i = 0; i < localStorage.length; i += 1) {
              const key = localStorage.key(i)
              if (key.startsWith('appointment_')) {
                const data = JSON.parse(localStorage.getItem(key))
                localAppointments.push({ id: key.replace('appointment_', ''), ...data })
              }
            }

            setAppointments(localAppointments)
            setDoctors(localDoctors)
            setIsAdmin(true)
          } catch (error) {
            console.error('Error loading demo data:', error)
          } finally {
            setLoading(false)
          }
        }
        loadDemoData()
        return
      }

      setCurrentUser(user)
      setIsAdmin(true)
    })

    return unsubscribe
  }, [navigate])

  useEffect(() => {
    if (!firestore || !isAdmin) return
    loadData()
  }, [isAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load appointments
      const appointmentsRef = collection(firestore, 'appointments')
      const appointmentsSnapshot = await getDocs(query(appointmentsRef, orderBy('createdAt', 'desc'), limit(200)))
      setAppointments(appointmentsSnapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() })))

      // Load doctors
      const doctorsRef = collection(firestore, 'doctors')
      const doctorsSnapshot = await getDocs(doctorsRef)
      setDoctors(doctorsSnapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() })))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/admin/login', { replace: true })
  }

  const updatePaymentStatus = async (appointmentId, status) => {
    if (!firestore) return
    try {
      await updateDoc(doc(firestore, 'appointments', appointmentId), {
        paymentStatus: status,
        updatedAt: serverTimestamp()
      })
      setAppointments(prev => prev.map(item => (item.id === appointmentId ? { ...item, paymentStatus: status } : item)))
      setMessage('Payment status updated successfully.')
    } catch (error) {
      console.error(error)
      setMessage('Failed to update payment status.')
    }
  }

  const deleteAppointment = async (appointmentId) => {
    if (!firestore) return
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      await deleteDoc(doc(firestore, 'appointments', appointmentId))
      setAppointments(prev => prev.filter(item => item.id !== appointmentId))
      setMessage('Appointment deleted successfully.')
    } catch (error) {
      console.error(error)
      setMessage('Failed to delete appointment.')
    }
  }

  const addDoctor = async () => {
    if (!firestore) return
    if (!newDoctor.name.trim() || !newDoctor.email.trim()) {
      setMessage('Please fill in name and email.')
      return
    }

    try {
      await addDoc(collection(firestore, 'doctors'), {
        ...newDoctor,
        createdAt: serverTimestamp()
      })
      setNewDoctor({ name: '', email: '', specialty: '', fee: '', schedule: '' })
      setShowAddDoctor(false)
      setMessage('Doctor added successfully.')
      loadData()
    } catch (error) {
      console.error(error)
      setMessage('Failed to add doctor.')
    }
  }

  const deleteDoctor = async (doctorId) => {
    if (!firestore) return
    if (!confirm('Are you sure you want to delete this doctor?')) return

    try {
      await deleteDoc(doc(firestore, 'doctors', doctorId))
      setDoctors(prev => prev.filter(item => item.id !== doctorId))
      setMessage('Doctor deleted successfully.')
    } catch (error) {
      console.error(error)
      setMessage('Failed to delete doctor.')
    }
  }

  const resetSerialNumbers = () => {
    if (!confirm('This will reset all serial numbers to 0. Continue?')) return
    setMessage('Serial numbers reset functionality not implemented yet.')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-purple-600">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">System Administration</h1>
            <p className="mt-2 text-slate-600">Manage doctors, appointments, and system settings.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Total Appointments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{appointments.length}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Total Doctors</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{doctors.length}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Pending Payments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {appointments.filter(item => item.paymentStatus === 'pending').length}
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Confirmed Payments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {appointments.filter(item => item.paymentStatus === 'confirmed').length}
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            ৳{appointments.filter(item => item.paymentStatus === 'confirmed').length * 400}
          </p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Today's Appointments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {appointments.filter(item => {
              const today = new Date().toISOString().slice(0, 10)
              const itemDate = item.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) || item.date
              return itemDate === today
            }).length}
          </p>
        </div>
      </div>

      {message && <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</div>}

      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/40">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'appointments'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'doctors'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Settings
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-lg font-semibold text-slate-900">All Appointments</p>
                <p className="mt-2 text-sm text-slate-500">Manage all patient appointments, verify payments, and delete if needed.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <FaArrowRight /> Total: {appointments.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    {['Patient', 'Phone', 'Doctor', 'Problem', 'Date', 'Payment', 'Actions'].map(header => (
                      <th key={header} className="py-3 pr-4 text-sm font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">Loading appointments...</td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">No appointments found.</td>
                    </tr>
                  ) : (
                    appointments.map(appointment => (
                      <tr key={appointment.id} className="border-b border-slate-200 last:border-none">
                        <td className="py-4 pr-4 text-sm text-slate-900">{appointment.name || appointment.patientName || 'Unknown'}</td>
                        <td className="py-4 pr-4 text-sm text-slate-900">{appointment.phone || 'N/A'}</td>
                        <td className="py-4 pr-4 text-sm text-slate-900">{appointment.doctorEmail || 'N/A'}</td>
                        <td className="py-4 pr-4 text-sm text-slate-900">{appointment.problemType || appointment.issue || 'N/A'}</td>
                        <td className="py-4 pr-4 text-sm text-slate-900">
                          {appointment.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="py-4 pr-4 text-sm">
                          <select
                            value={appointment.paymentStatus || 'pending'}
                            onChange={event => updatePaymentStatus(appointment.id, event.target.value)}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-4 pr-4 space-y-2 text-sm">
                          <button
                            type="button"
                            onClick={() => setScreenshotUrl(appointment.paymentScreenshotURL || appointment.paymentScreenshot || '')}
                            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100"
                          >
                            <FaEye className="mr-2" /> Screenshot
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAppointment(appointment.id)}
                            className="inline-flex w-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
                          >
                            <FaTrash className="mr-2" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <p className="text-lg font-semibold text-slate-900">Doctor Management</p>
                <p className="mt-2 text-sm text-slate-500">Add, view, and manage doctors in the system.</p>
              </div>
              <button
                onClick={() => setShowAddDoctor(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700"
              >
                <FaPlus /> Add Doctor
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map(doctor => (
                <div key={doctor.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FaUserMd className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-semibold text-slate-900">{doctor.name}</p>
                        <p className="text-sm text-slate-600">{doctor.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDoctor(doctor.id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p><strong>Specialty:</strong> {doctor.specialty || 'Not specified'}</p>
                    <p><strong>Fee:</strong> {doctor.fee || 'Not specified'}</p>
                    <p><strong>Schedule:</strong> {doctor.schedule || 'Not specified'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-slate-900">System Analytics</p>
              <p className="mt-2 text-sm text-slate-500">Detailed statistics and insights about your telemedicine practice.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Disease Distribution</h3>
                <div className="space-y-3">
                  {['চর্ম ও যৌন রোগ', 'মেডিসিন', 'ডায়াবেটিস', 'উচ্চরক্তচাপ', 'মানসিক রোগ'].map(disease => {
                    const count = appointments.filter(item => item.problemType?.includes(disease) || item.issue?.includes(disease)).length
                    return (
                      <div key={disease} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{disease}</span>
                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Status</h3>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'rejected'].map(status => {
                    const count = appointments.filter(item => item.paymentStatus === status).length
                    const percentage = appointments.length > 0 ? Math.round((count / appointments.length) * 100) : 0
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 capitalize">{status}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{count}</span>
                          <span className="text-xs text-slate-500">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Doctor Performance</h3>
                <div className="space-y-3">
                  {doctors.map(doctor => {
                    const doctorAppointments = appointments.filter(item => item.doctorEmail === doctor.email).length
                    return (
                      <div key={doctor.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{doctor.name}</span>
                        <span className="text-sm font-semibold text-slate-900">{doctorAppointments} patients</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Trends</h3>
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                    const dayAppointments = appointments.filter(item => {
                      const date = item.createdAt?.toDate?.() || new Date(item.date)
                      return date?.toLocaleLowerCase().includes(day.toLowerCase().slice(0, 3))
                    }).length
                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{day.slice(0, 3)}</span>
                        <span className="text-sm font-semibold text-slate-900">{dayAppointments}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Age Groups</h3>
                <div className="space-y-3">
                  {['Child (0-12)', 'Teen (13-19)', 'Adult (20-40)', 'Middle-aged (41-60)', 'Senior (60+)'].map(ageGroup => {
                    const count = appointments.filter(item => item.ageGroup === ageGroup).length
                    return (
                      <div key={ageGroup} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{ageGroup}</span>
                        <span className="text-sm font-semibold text-slate-900">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Expected</span>
                    <span className="text-sm font-semibold text-slate-900">৳{appointments.length * 400}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Confirmed Revenue</span>
                    <span className="text-sm font-semibold text-green-600">৳{appointments.filter(item => item.paymentStatus === 'confirmed').length * 400}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Pending Revenue</span>
                    <span className="text-sm font-semibold text-amber-600">৳{appointments.filter(item => item.paymentStatus === 'pending').length * 400}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <p className="text-lg font-semibold text-slate-900">System Settings</p>
              <p className="mt-2 text-sm text-slate-500">Manage global settings and system maintenance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Serial Number Management</h3>
                <p className="text-sm text-slate-600 mb-4">Reset all serial numbers to start fresh for the day.</p>
                <button
                  onClick={resetSerialNumbers}
                  className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Reset All Serials
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900 mb-3">System Status</h3>
                <p className="text-sm text-slate-600 mb-4">Current system health and statistics.</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Firebase:</strong> {firestore ? 'Connected' : 'Disconnected'}</p>
                  <p><strong>Auth:</strong> {auth ? 'Connected' : 'Disconnected'}</p>
                  <p><strong>Appointments:</strong> {appointments.length}</p>
                  <p><strong>Doctors:</strong> {doctors.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h3 className="text-2xl font-semibold text-slate-900">Add New Doctor</h3>
              <button
                type="button"
                onClick={() => setShowAddDoctor(false)}
                className="rounded-full bg-slate-100 px-3 py-2 text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={event => setNewDoctor(prev => ({ ...prev, name: event.target.value }))}
                  className="input-field"
                  placeholder="Doctor's full name"
                />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={event => setNewDoctor(prev => ({ ...prev, email: event.target.value }))}
                  className="input-field"
                  placeholder="doctor@example.com"
                />
              </div>
              <div>
                <label className="label-text">Specialty</label>
                <input
                  type="text"
                  value={newDoctor.specialty}
                  onChange={event => setNewDoctor(prev => ({ ...prev, specialty: event.target.value }))}
                  className="input-field"
                  placeholder="e.g., Cardiology, General Medicine"
                />
              </div>
              <div>
                <label className="label-text">Fee</label>
                <input
                  type="text"
                  value={newDoctor.fee}
                  onChange={event => setNewDoctor(prev => ({ ...prev, fee: event.target.value }))}
                  className="input-field"
                  placeholder="e.g., ৪০০ টাকা"
                />
              </div>
              <div>
                <label className="label-text">Schedule</label>
                <input
                  type="text"
                  value={newDoctor.schedule}
                  onChange={event => setNewDoctor(prev => ({ ...prev, schedule: event.target.value }))}
                  className="input-field"
                  placeholder="e.g., সন্ধ্যা ৭টা – ১০টা"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowAddDoctor(false)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addDoctor}
                className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {screenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setScreenshotUrl('')}
              className="absolute right-4 top-4 rounded-full bg-slate-100 px-3 py-2 text-slate-700"
            >
              Close
            </button>
            <div className="mt-6">
              <img src={screenshotUrl} alt="Payment screenshot" className="w-full rounded-3xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}