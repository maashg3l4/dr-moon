import { Link } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n'
import { MdClose } from 'react-icons/md'

export default function Sidebar({ isOpen, onClose }) {
  const language = useAppStore(state => state.language)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">
            {t(language, 'appTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-slate-400 hover:text-slate-600"
          >
            <MdClose size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          <Link
            to="/"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <a
            href="/#services"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            Services
          </a>
          <Link
            to="/appointment"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Appointment
          </Link>
          <Link
            to="/serial"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
          >
            Serial Panel
          </Link>
          <a
            href="https://wa.me/8801571352918"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
          >
            WhatsApp
          </a>
          <Link
            to="/doctor/login"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"
          >
            Doctor Panel
          </Link>
          <Link
            to="/admin/login"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
          >
            Admin Panel
          </Link>
        </nav>
      </div>
    </>
  )
}