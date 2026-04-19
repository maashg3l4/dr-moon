import { Link, Routes, Route } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import Home from './pages/Home'
import AppointmentWizard from './pages/AppointmentWizard'
import SerialPanel from './pages/SerialPanel'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorLogin from './pages/DoctorLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import LanguageSwitcher from './components/LanguageSwitcher'
import { t } from './i18n'

function App() {
  const language = useAppStore(state => state.language)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-700">
              ডা. তাসদিকুল ইসলাম মুন
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {t(language, 'appTitle')}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              <Link to="/" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Home
              </Link>
              <a href="/#services" className="rounded-full border border-slate-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                Services
              </a>
              <Link to="/appointment" className="rounded-full border border-slate-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                Appointment
              </Link>
              <Link to="/serial" className="rounded-full border border-slate-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100">
                Serial Panel
              </Link>
              <a href="https://wa.me/8801571352918" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
                WhatsApp
              </a>
              <Link to="/doctor/login" className="rounded-full border border-slate-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100">
                Doctor Panel
              </Link>
              <Link to="/admin/login" className="rounded-full border border-slate-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100">
                Admin Panel
              </Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<AppointmentWizard />} />
          <Route path="/serial" element={<SerialPanel />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
