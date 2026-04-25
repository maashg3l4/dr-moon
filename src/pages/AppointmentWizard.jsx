import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TextToSpeechButton } from '../components/TextToSpeechButton'
import { t } from '../i18n'
import { saveAppointment } from '../services/appointmentNotifications'
import { useAppointmentNotifications, formatDateBN } from '../hooks/useAppointmentNotifications'

const ageGroups = ['০-৫', '৬-১২', '১৩-১৮', '১৯-৩৫', '৩৬-৫০', '৫০+']
const timeSlots = ['সন্ধ্যা ৭-৮টা', '৮-৯টা', '৯-১০টা']
const problemTypes = [
  { value: 'চর্ম', label: 'চর্ম' },
  { value: 'যৌন', label: 'যৌন' },
  { value: 'ডায়াবেটিস', label: 'ডায়াবেটিস' },
  { value: 'উচ্চরক্তচাপ', label: 'উচ্চরক্তচাপ' },
  { value: 'মানসিক রোগ', label: 'মানসিক রোগ' },
  { value: 'অন্যান্য', label: 'অন্যান্য' },
]

const initialForm = {
  name: '',
  phone: '',
  ageGroup: '',
  problemType: '',
  timeSlot: '',
  appointmentDate: '',
}

export default function AppointmentWizard() {
  const language = useAppStore(state => state.language)
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useAppointmentNotifications()

  const stepLabel = useMemo(() => {
    if (step === 1) return `${t(language, 'step1')}`
    if (step === 2) return `${t(language, 'step2')}`
    return `${t(language, 'step3')}`
  }, [language, step])

  const handleInputChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // --- NEW SSLCOMMERZ PAYMENT LOGIC ---
  const handlePayment = async () => {
    setSubmitting(true);
    setMessage('প্রসেসিং হচ্ছে...');
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appointmentId: `DRM-${Date.now()}`, 
                amount: 500, // Your fee
                patientName: form.name,
                patientEmail: form.phone + "@example.com", 
                patientPhone: form.phone
            }),
        });

        const result = await response.json();
        if (result.url) {
            window.location.replace(result.url); // Redirect to SSLCommerz
        } else {
            setMessage("পেমেন্ট শুরু করা যায়নি। আবার চেষ্টা করুন।");
        }
    } catch (error) {
        console.error(error);
        setMessage("একটি ত্রুটি ঘটেছে।");
    } finally {
        setSubmitting(false);
    }
  };

  const startVoiceTyping = field => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice typing is not supported.')
      return
    }
    const recognizer = new SpeechRecognition()
    recognizer.lang = language === 'bn' ? 'bn-BD' : 'en-US'
    recognizer.onresult = event => {
      const transcript = event.results[0][0].transcript
      setForm(prev => ({ ...prev, [field]: transcript }))
    }
    recognizer.start()
  }

  const validateStep = currentStep => {
    const nextErrors = {}
    if (currentStep === 1) {
      if (!form.name.trim()) nextErrors.name = 'required'
      if (!/^01\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'invalid'
      if (!form.ageGroup) nextErrors.ageGroup = 'required'
      if (!form.problemType) nextErrors.problemType = 'required'
    }
    if (currentStep === 3) {
      if (!form.timeSlot) nextErrors.timeSlot = 'required'
      if (!form.appointmentDate) nextErrors.appointmentDate = 'required'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(3, prev + 1))
    }
  }

  const handleBack = () => setStep(prev => Math.max(1, prev - 1))

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitting(true)
    try {
      const serialNumber = Math.floor(Math.random() * 100) + 1
      const appointmentData = { ...form, serialNumber }
      await saveAppointment(appointmentData)
      localStorage.setItem(`drmoon-serial-${form.phone}`, JSON.stringify(appointmentData))
      setMessage(`${t(language, 'appointmentSaved')}`)
      setTimeout(() => navigate(`/serial?phone=${encodeURIComponent(form.phone)}`), 1500)
    } catch (error) {
      setMessage('Submit failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">{t(language, 'appointment')}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{stepLabel}</h2>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">স্টেপ {step} / 3</div>
        </div>
      </div>

      {/* Step 1: Info */}
      {step === 1 && (
        <div className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-lg">
          <div>
            <label className="label-text">{t(language, 'patientName')}</label>
            <div className="relative">
              <input name="name" value={form.name} onChange={handleInputChange} className="input-field" placeholder="নাম লিখুন" />
              <button type="button" onClick={() => startVoiceTyping('name')} className="absolute right-2 top-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm">ভয়েস টাইপিং</button>
            </div>
          </div>
          <div>
            <label className="label-text">{t(language, 'phoneNumber')}</label>
            <input name="phone" value={form.phone} onChange={handleInputChange} className="input-field" placeholder="01XXXXXXXXX" maxLength={11} />
          </div>
          <div>
            <label className="label-text">{t(language, 'ageGroup')}</label>
            <select name="ageGroup" value={form.ageGroup} onChange={handleInputChange} className="input-field">
              <option value="">-- নির্বাচন করুন --</option>
              {ageGroups.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">{t(language, 'problemType')}</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {problemTypes.map(type => (
                <button key={type.value} type="button" onClick={() => setForm(prev => ({ ...prev, problemType: type.value }))}
                  className={`rounded-3xl border px-4 py-4 ${form.problemType === type.value ? 'border-sky-500 bg-sky-50' : 'bg-white'}`}>
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: UPDATED SSLCOMMERZ PAYMENT BUTTON */}
      {step === 2 && (
        <div className="rounded-[2rem] bg-white p-8 shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">পেমেন্ট সম্পন্ন করুন</h3>
            <p className="text-slate-600 mb-6">নিরাপদ পেমেন্টের জন্য নিচের বাটনে ক্লিক করুন।</p>
            <button 
                type="button"
                disabled={submitting}
                onClick={handlePayment} 
                className="w-full max-w-md mx-auto rounded-3xl bg-sky-600 py-5 text-lg font-bold text-white shadow-xl hover:bg-sky-700 transition disabled:opacity-50"
            >
                {submitting ? 'প্রসেসিং হচ্ছে...' : 'SSLCommerz দিয়ে পেমেন্ট করুন'}
            </button>
            <p className="mt-4 text-xs text-slate-400">বিকাশ, নগদ, রকেট এবং কার্ড সমর্থিত।</p>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-lg">
          <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleInputChange} className="input-field" min={new Date().toISOString().split('T')[0]} />
          <div className="grid gap-3 sm:grid-cols-3">
            {timeSlots.map(slot => (
              <button key={slot} type="button" onClick={() => setForm(prev => ({ ...prev, timeSlot: slot }))}
                className={`rounded-3xl border p-4 ${form.timeSlot === slot ? 'border-sky-500 bg-sky-50' : 'bg-white'}`}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-lg">
        <p className="text-sm text-sky-600 font-medium">{message}</p>
        <div className="flex gap-3">
            {step > 1 && <button onClick={handleBack} className="px-6 py-3 border rounded-2xl">Back</button>}
            {step < 3 && step !== 2 && <button onClick={handleNext} className="bg-sky-600 text-white px-8 py-3 rounded-2xl">Next</button>}
            {/* Note: In Step 2, the user must click the Payment button, so we hide the Next button there */}
            {step === 3 && <button onClick={handleSubmit} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl">Submit</button>}
        </div>
      </div>
    </div>
  )
}