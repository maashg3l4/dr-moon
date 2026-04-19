import { useEffect, useMemo, useState } from 'react'
import { firestore } from '../firebaseConfig'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

function formatDate(value) {
  if (!value) return 'Unknown'
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') {
    const date = value.toDate()
    return date.toLocaleDateString('en-GB')
  }
  if (value instanceof Date) return value.toLocaleDateString('en-GB')
  return String(value)
}

function loadLocalAppointments() {
  const result = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (!key) continue
    if (key.startsWith('appointment_') || key.startsWith('drmoon-serial-')) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}')
        result.push({ id: key, ...item })
      } catch (error) {
        console.warn('Failed to parse local appointment', key, error)
      }
    }
  }
  return result.sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0
    const bTime = b.date ? new Date(b.date).getTime() : 0
    return bTime - aTime
  })
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true)
      setError('')

      if (firestore) {
        try {
          const appointmentsRef = collection(firestore, 'appointments')
          const snapshot = await getDocs(query(appointmentsRef, orderBy('createdAt', 'desc'), limit(100)))
          const data = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }))
          setAppointments(data)
          return
        } catch (firebaseError) {
          console.warn('DoctorDashboard Firebase load failed:', firebaseError)
          setError('Unable to load data from Firestore. Showing local demo appointments instead.')
        }
      }

      setAppointments(loadLocalAppointments())
      setLoading(false)
    }

    loadAppointments()
  }, [])

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const todayAppointments = useMemo(
    () => appointments.filter(item => {
      const itemDate = item.date || item.createdAt?.toDate?.()?.toISOString?.()?.slice(0, 10) || ''
      return itemDate.startsWith(todayKey)
    }),
    [appointments, todayKey]
  )

  const unpaidAppointments = useMemo(
    () => appointments.filter(item => item.paymentStatus === 'pending' || item.paymentStatus === 'unpaid'),
    [appointments]
  )

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Doctor Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">ডা. তাসদিকুল ইসলাম মুন</h1>
            <p className="mt-2 text-slate-600">পছন্দের টেলিমেডিসিন, চর্ম ও যৌন, ডায়াবেটিস, উচ্চরক্তচাপ, মানসিক রোগ</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            {appointments.length} appointments loaded
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Total appointments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{appointments.length}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Today's appointments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{todayAppointments.length}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm text-slate-500">Pending payments</p>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{unpaidAppointments.length}</p>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Appointment overview</p>
            <p className="mt-2 text-sm text-slate-500">Review the latest patient bookings and serial numbers.</p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700">
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Serial</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4" colSpan={5}>
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td className="px-4 py-4" colSpan={5}>
                    No appointments found yet.
                  </td>
                </tr>
              ) : (
                appointments.slice(0, 10).map(appointment => (
                  <tr key={appointment.id} className="border-b border-slate-100">
                    <td className="px-4 py-4 text-slate-900">{appointment.name || appointment.patientName || 'Unknown'}</td>
                    <td className="px-4 py-4 text-slate-700">{appointment.phone || 'N/A'}</td>
                    <td className="px-4 py-4 text-slate-700">{formatDate(appointment.date)}</td>
                    <td className="px-4 py-4 text-slate-700">{appointment.serialNumber ?? appointment.serial ?? '—'}</td>
                    <td className="px-4 py-4 text-slate-700">{appointment.paymentStatus || appointment.payment || 'pending'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[2rem] bg-slate-50 p-6 text-slate-700 shadow-lg shadow-slate-200/30">
        <p className="text-sm font-semibold text-slate-900">Note:</p>
        <p className="mt-2 text-sm leading-6">
          The doctor panel now loads safely without breaking. Once Firebase data is available, appointments will surface automatically.
        </p>
      </div>
    </div>
  )
}
