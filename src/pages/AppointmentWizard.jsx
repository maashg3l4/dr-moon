import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { TextToSpeechButton } from '../components/TextToSpeechButton'
import { PaymentSystem } from '../components/PaymentSystem'
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

// Inside AppointmentWizard.jsx
const handlePayment = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                appointmentId: currentAppointmentId,
                amount: fee,
                patientName: formData.name,
                patientEmail: formData.email,
                patientPhone: formData.phone
            }),
        });

        const result = await response.json();
        if (result.url) {
            window.location.replace(result.url); // Redirect to SSLCommerz
        } else {
            toast.error("Payment initiation failed.");
        }
    } catch (error) {
        console.error(error);
        toast.error("An error occurred.");
    } finally {
        setLoading(false);
    }
};

const initialForm = {
  name: '',
  phone: '',
  ageGroup: '',
  problemType: '',
  paymentMethod: 'bkash',
  transactionId: '',
  screenshotFile: null,
  screenshotURL: '',
  timeSlot: '',
  appointmentDate: '',
}

export default function AppointmentWizard() {
  const language = useAppStore(state => state.language)
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [screenshotPreview, setScreenshotPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  // Enable appointment notifications
  useAppointmentNotifications()

  useEffect(() => {
    if (form.screenshotFile) {
      const url = URL.createObjectURL(form.screenshotFile)
      setScreenshotPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setScreenshotPreview('')
  }, [form.screenshotFile])

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

  const handleScreenshot = event => {
    const file = event.target.files?.[0]
    if (file) {
      setForm(prev => ({ ...prev, screenshotFile: file }))
    }
  }

  const speakHelp = () => {
    const text = t(language, 'paymentInstructions')
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US'
    window.speechSynthesis.speak(utterance)
  }

  const startVoiceTyping = field => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice typing is not supported in this browser.')
      return
    }

    const recognizer = new SpeechRecognition()
    recognizer.lang = language === 'bn' ? 'bn-BD' : 'en-US'
    recognizer.interimResults = false
    recognizer.maxAlternatives = 1
    recognizer.onresult = event => {
      const transcript = event.results[0][0].transcript
      setForm(prev => ({ ...prev, [field]: transcript }))
    }
    recognizer.onerror = () => {
      alert('Voice typing failed, please try again.')
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

    if (currentStep === 2) {
      if (!form.transactionId.trim()) nextErrors.transactionId = 'required'
      if (!form.screenshotFile) nextErrors.screenshotFile = 'required'
    }

    if (currentStep === 3) {
      if (!form.timeSlot) nextErrors.timeSlot = 'required'
      if (!form.appointmentDate) nextErrors.appointmentDate = 'required'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const uploadScreenshot = async () => {
    if (!form.screenshotFile) return ''
    const storageRef = ref(storage, `screenshots/${Date.now()}-${form.screenshotFile.name}`)
    const snapshot = await uploadBytes(storageRef, form.screenshotFile)
    return getDownloadURL(snapshot.ref)
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(3, prev + 1))
    }
  }

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSubmitting(true)
    setMessage('')

    try {
      const serialNumber = Math.floor(Math.random() * 100) + 1

      const appointmentData = {
        name: form.name,
        phone: form.phone,
        ageGroup: form.ageGroup,
        problemType: form.problemType,
        paymentMethod: form.paymentMethod,
        transactionId: form.transactionId,
        timeSlot: form.timeSlot,
        appointmentDate: form.appointmentDate,
        serialNumber,
      }

      // Save to Firebase and schedule notifications
      await saveAppointment(appointmentData)

      // Also save to localStorage for backward compatibility
      localStorage.setItem(
        `drmoon-serial-${form.phone}`,
        JSON.stringify(appointmentData),
      )

      setMessage(`${t(language, 'appointmentSaved')} ${t(language, 'smsSent')}`)
      setTimeout(() => {
        navigate(`/serial?phone=${encodeURIComponent(form.phone)}`)
      }, 1500)
    } catch (error) {
      console.error(error)
      setMessage('Submit failed. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">{t(language, 'appointment')}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">{stepLabel}</h2>
            <p className="mt-3 max-w-2xl text-slate-600">{t(language, 'appointmentCta')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            স্টেপ {step} / 3
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <div>
            <label className="label-text" htmlFor="name">
              {t(language, 'patientName')}
            </label>
            <div className="relative">
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder={t(language, 'patientName')}
              />
              <button
                type="button"
                onClick={() => startVoiceTyping('name')}
                className="absolute right-2 top-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm"
              >
                {t(language, 'voiceTyping')}
              </button>
            </div>
            {errors.name && <p className="mt-2 text-sm text-rose-600">আপনার নাম লিখুন।</p>}
          </div>

          <div>
            <label className="label-text" htmlFor="phone">
              {t(language, 'phoneNumber')}
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              className="input-field"
              placeholder="01XXXXXXXXX"
              maxLength={11}
            />
            {errors.phone && <p className="mt-2 text-sm text-rose-600">১১ ডিজিট, ০১ দিয়ে শুরু করুন।</p>}
          </div>

          <div>
            <label className="label-text" htmlFor="ageGroup">
              {t(language, 'ageGroup')}
            </label>
            <select id="ageGroup" name="ageGroup" value={form.ageGroup} onChange={handleInputChange} className="input-field">
              <option value="">-- {t(language, 'ageGroup')} --</option>
              {ageGroups.map(item => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.ageGroup && <p className="mt-2 text-sm text-rose-600">একটি বয়স গ্রুপ নির্বাচন করুন।</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label-text">{t(language, 'problemType')}</label>
              <TextToSpeechButton text={t(language, 'problemType')} label={t(language, 'helpAudio')} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {problemTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, problemType: type.value }))}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    form.problemType === type.value
                      ? 'border-sky-500 bg-sky-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold">{type.label}</p>
                </button>
              ))}
            </div>
            {errors.problemType && <p className="mt-2 text-sm text-rose-600">সমস্যার ধরন নির্বাচন করুন।</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <PaymentSystem
            onPaymentMethod={(method) => setForm(prev => ({ ...prev, paymentMethod: method }))}
            selectedMethod={form.paymentMethod}
            transactionId={form.transactionId}
            onTransactionChange={(id) => {
              setForm(prev => ({ ...prev, transactionId: id }))
              setErrors(prev => ({ ...prev, transactionId: '' }))
            }}
            screenshotFile={form.screenshotFile}
            onScreenshotChange={(file) => {
              setForm(prev => ({ ...prev, screenshotFile: file }))
              setErrors(prev => ({ ...prev, screenshotFile: '' }))
            }}
          />
          {errors.transactionId && <p className="mt-4 text-sm text-rose-600">Transaction ID প্রয়োজন।</p>}
          {errors.screenshotFile && <p className="mt-2 text-sm text-rose-600">স্ক্রিনশট প্রয়োজন।</p>}
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40">
          <div>
            <label className="label-text" htmlFor="appointmentDate">
              অ্যাপয়েন্টমেন্ট তারিখ
            </label>
            <input
              id="appointmentDate"
              name="appointmentDate"
              type="date"
              value={form.appointmentDate}
              onChange={handleInputChange}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
            {form.appointmentDate && (
              <p className="mt-2 text-sm text-emerald-600">
                নির্বাচিত তারিখ: {formatDateBN(form.appointmentDate)}
              </p>
            )}
            {errors.appointmentDate && <p className="mt-2 text-sm text-rose-600">তারিখ নির্বাচন করুন।</p>}
          </div>

          <div>
            <p className="label-text">{t(language, 'timeSlot')}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {timeSlots.map(slot => (
                <label key={slot} className={`rounded-3xl border p-4 text-center transition ${form.timeSlot === slot ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <input className="sr-only" type="radio" name="timeSlot" value={slot} checked={form.timeSlot === slot} onChange={handleInputChange} />
                  <span className="block text-lg font-semibold text-slate-900">{slot}</span>
                </label>
              ))}
            </div>
            {errors.timeSlot && <p className="mt-2 text-sm text-rose-600">স্লট নির্বাচন করুন।</p>}
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm text-emerald-900">✓ অ্যাপয়েন্টমেন্টের দিন আপনি এসএমএস রিমাইন্ডার পাবেন।</p>
            <p className="mt-2 text-sm text-slate-700">সাবমিট করার পর আপনার সিরিয়াল নম্বর স্বয়ংক্রিয়ভাবে তৈরি হবে এবং ফোনে এসএমএস পাঠানো হবে।</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-[2rem] bg-white p-6 text-slate-700 shadow-lg shadow-slate-200/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {step > 1 && (
            <button type="button" onClick={handleBack} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              Back
            </button>
          )}
          {step < 3 && (
            <button type="button" onClick={handleNext} className="primary-action">
              Next
            </button>
          )}
          {step === 3 && (
            <button type="button" disabled={submitting} onClick={handleSubmit} className="primary-action">
              {submitting ? 'Submitting...' : t(language, 'submitAppointment')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
