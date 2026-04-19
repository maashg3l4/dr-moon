import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHeartbeat, FaClock, FaStethoscope, FaWhatsapp, FaShieldVirus, FaCommentMedical, FaClipboardList } from 'react-icons/fa'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n'
import { TextToSpeechButton } from '../components/TextToSpeechButton'
import profileImage from '../assets/hero.png'

const services = [
  'চর্ম ও যৌন রোগ',
  'মেডিসিন',
  'ডায়াবেটিস',
  'উচ্চরক্তচাপ',
  'মানসিক রোগ',
]

const loadSettings = {
  green: { color: 'bg-emerald-500', labelBn: 'কম চাপ', labelEn: 'Low load' },
  yellow: { color: 'bg-amber-400', labelBn: 'মাঝারি চাপ', labelEn: 'Medium load' },
  red: { color: 'bg-rose-500', labelBn: 'উচ্চ চাপ', labelEn: 'High load' },
}

export default function Home() {
  const navigate = useNavigate()
  const language = useAppStore(state => state.language)
  const currentLoad = useAppStore(state => state.currentLoad)

  const traffic = useMemo(() => loadSettings[currentLoad] || loadSettings.green, [currentLoad])

  return (
    <section className="space-y-10">
      {/* Quick Navigation */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="font-medium text-slate-700">Quick Links:</span>
          <a href="#hero" className="text-sky-600 hover:text-sky-800 hover:underline">Hero</a>
          <span className="text-slate-400">•</span>
          <a href="#services" className="text-sky-600 hover:text-sky-800 hover:underline">Services</a>
          <span className="text-slate-400">•</span>
          <a href="#guidelines" className="text-sky-600 hover:text-sky-800 hover:underline">Guidelines</a>
          <span className="text-slate-400">•</span>
          <a href="#appointment" onClick={() => navigate('/appointment')} className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer">Book Appointment</a>
          <span className="text-slate-400">•</span>
          <a href="#serial" onClick={() => navigate('/serial')} className="text-sky-600 hover:text-sky-800 hover:underline cursor-pointer">Serial Panel</a>
        </div>
      </div>

      {/* Stethoscope Stories Header Section */}
      <div id="hero" className="grid gap-8 rounded-[2rem] bg-gradient-to-br from-sky-50 via-blue-50 to-white px-6 py-8 shadow-lg shadow-blue-100/30 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-sky-500">
            Stethoscope Stories
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">ডা. তাসদিকুল ইসলাম মুন</h2>
          <p className="text-slate-600 max-w-3xl mx-auto lg:mx-0">{t(language, 'heroSubtitle')}</p>

          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto lg:mx-0 mb-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500 mb-1">{t(language, 'feeLabel')}</p>
              <p className="text-2xl font-bold text-sky-600">৪০০ টাকা</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500 mb-1">{t(language, 'scheduleLabel')}</p>
              <p className="text-2xl font-bold text-sky-600">সন্ধ্যা ৭টা – ১০টা</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500 mb-1">সেবা</p>
              <p className="text-lg font-bold text-sky-600">৫+ বিভাগ</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            {services.map(service => (
              <span key={service} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm text-slate-700">
                <FaShieldVirus className="h-3.5 w-3.5 text-sky-500" /> {service}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="h-[560px] w-full max-w-[520px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/40">
            <img
              src="/images/doctor.jpg"
              alt="ডা. তাসদিকুল ইসলাম মুন"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22%238b5cf6%22%3Eডাক্তারের ছবি%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
        </div>
      </div>

      <div id="services" className="rounded-[2rem] bg-white px-6 py-8 shadow-xl shadow-slate-200/50 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[2rem] border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-red-50/80 p-5 text-rose-800 shadow-md">
              <div className="flex items-start gap-3">
                <span className="mt-1 text-2xl">⚠️</span>
                <p className="font-semibold leading-relaxed">{t(language, 'emergencyWarning')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600">{t(language, 'services')}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                ডা. তাসদিকুল ইসলাম মুন – {t(language, 'appTitle')}
              </h2>
              <p className="mt-4 max-w-2xl text-slate-600">{t(language, 'heroSubtitle')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{t(language, 'feeLabel')}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">৪০০ টাকা</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">{t(language, 'scheduleLabel')}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">সন্ধ্যা ৭টা – রাত ১০টা</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button type="button" className="primary-action" onClick={() => navigate('/appointment')}>
                {t(language, 'appointmentCta')}
              </button>
              <a
                href="https://wa.me/8801571352918"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <FaWhatsapp className="mr-2 h-4 w-4 text-emerald-600" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-sky-50 to-white p-4 shadow-lg shadow-sky-200/60 sticky top-24">
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="relative w-full overflow-hidden rounded-[1.5rem] bg-slate-100 shadow-xl">
                <img
                  src={profileImage}
                  alt="ডা. তাসদিকুল ইসলাম মুন - প্রোফাইল ছবি"
                  className="h-80 w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22%238b5cf6%22%3Eডাক্তারের ছবি%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
              <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                <p className="text-sm text-slate-500">ডা. তাসদিকুল ইসলাম মুন</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">পছন্দের টেলিমেডিসিন</h3>
                <p className="mt-3 text-sm text-slate-600">চর্ম, যৌন, ডায়াবেটিস, উচ্চরক্তচাপ ও মানসিক রোগে সেবা</p>
                <div className="mt-5 space-y-2">
                  {services.map(service => (
                    <span key={service} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
                      <FaShieldVirus className="h-3.5 w-3.5 text-sky-500" /> {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="guidelines" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="secondary-card">
          <h3 className="text-xl font-semibold text-slate-900">সার্বিক নির্দেশিকা</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: t(language, 'step1'), icon: FaClock },
              { label: t(language, 'step2'), icon: FaClipboardList },
              { label: t(language, 'step3'), icon: FaStethoscope },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="secondary-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Current queue status</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{language === 'bn' ? traffic.labelBn : traffic.labelEn}</p>
            </div>
            <span className={`status-pill ${traffic.color}`}></span>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-4">
              <FaHeartbeat className="mt-1 h-6 w-6 text-sky-500" />
              <div>
                <p className="text-sm text-slate-600">{t(language, 'services')} include telemedicine, appointment booking, live queue updates, and prescription downloads.</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <TextToSpeechButton text={t(language, 'heroSubtitle')} label={t(language, 'helpAudio')} />
            <div className="flex flex-wrap gap-2">
              <a
                href="#guidelines"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View Guidelines
              </a>
              <a
                href="https://wa.me/8801571352918"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-200 bg-green-50 px-4 py-2 text-center text-sm font-semibold text-emerald-700 transition hover:bg-green-100"
              >
                {t(language, 'whatsappHelp')}
              </a>
              <button
                onClick={() => navigate('/serial')}
                className="rounded-2xl border border-slate-200 bg-sky-50 px-4 py-2 text-center text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                Check Serial Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
