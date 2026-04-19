import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n'

export default function SerialPanel() {
  const language = useAppStore(state => state.language)
  const [searchParams] = useSearchParams()
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [appointment, setAppointment] = useState(null)
  const [status, setStatus] = useState('Demo Mode - No Firebase')
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!phone) return
    const cached = localStorage.getItem(`drmoon-serial-${phone}`)
    if (cached) {
      setAppointment(JSON.parse(cached))
      setStatus('Local storage data loaded')
    } else {
      setAppointment(null)
      setStatus('No appointment found for this phone number.')
    }
  }, [phone])

  const handleSubmit = event => {
    event.preventDefault()
    if (!phone.trim()) return
    setPhone(phone.trim())
  }

  const queueAhead = appointment?.serialNumber ? Math.max(appointment.serialNumber - 1, 0) : 0
  const estimated = queueAhead * 10

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-600">{t(language, 'serialTitle')}</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{t(language, 'loginByPhone')}</h2>
        <p className="mt-3 max-w-2xl text-slate-600">{language === 'bn' ? 'ফোন নম্বর দিয়ে আপনার সিরিয়াল ও অপেক্ষার সময় দেখুন।' : 'View your serial and waiting time using phone number.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
        <label className="label-text" htmlFor="phone-search">
          Phone number
        </label>
        <input
          id="phone-search"
          type="text"
          value={phone}
          onChange={event => setPhone(event.target.value)}
          placeholder="01XXXXXXXXX"
          className="input-field"
        />
        <button type="submit" className="primary-action w-full">
          Search
        </button>
      </form>

      {offline && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
          {t(language, 'offlineNotice')}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <h3 className="text-xl font-semibold text-slate-900">{appointment ? t('bn', 'currentSerial') : 'আপনার সিরিয়াল তথ্য'}</h3>
          {appointment ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{t('bn', 'currentSerial')}</p>
                <p className="mt-2 text-4xl font-semibold text-slate-900">{appointment.serialNumber}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{t('bn', 'queueAhead')}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{queueAhead}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{t('bn', 'waitTime')}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{estimated} মিনিট</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="mt-1 text-lg font-medium text-slate-900">{appointment.phone}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি। ফোন নম্বর দিয়ে আবার চেক করুন।
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Status</p>
          <p className="mt-3 text-base text-slate-700">{status}</p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="https://wa.me/8801571352918"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 transition hover:bg-green-100"
            >
              WhatsApp for support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
