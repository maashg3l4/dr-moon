import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n'
import { FaCopy, FaPhone, FaCheckCircle } from 'react-icons/fa'

export function PaymentSystem({ onPaymentMethod, selectedMethod, transactionId, onTransactionChange, screenshotFile, onScreenshotChange }) {
  const language = useAppStore(state => state.language)
  const [copiedAccount, setCopiedAccount] = useState('')
  const [screenshotPreview, setScreenshotPreview] = useState('')

  const paymentMethods = [
    {
      id: 'bkash',
      name: 'bKash',
      icon: '📱',
      account: '01748****18',
      fullAccount: '01748XXXXXXX18',
      instructions: [
        { step: 1, text: 'বিকাশ অ্যাপ খুলুন' },
        { step: 2, text: '"Send Money" ক্লিক করুন' },
        { step: 3, text: `সংখ্যা দিন: ${language === 'bn' ? '01748XXXXXXX18' : '01748XXXXXXX18'}` },
        { step: 4, text: '৪০০ টাকা পাঠান' },
        { step: 5, text: 'পিন দিয়ে সম্পন্ন করুন' },
      ],
      instructionsEn: [
        { step: 1, text: 'Open bKash app' },
        { step: 2, text: 'Click "Send Money"' },
        { step: 3, text: 'Enter number: 01748XXXXXXX18' },
        { step: 4, text: 'Send 400 BDT' },
        { step: 5, text: 'Complete with PIN' },
      ],
    },
    {
      id: 'nagad',
      name: 'Nagad',
      icon: '💳',
      account: '01748****18',
      fullAccount: '01748XXXXXXX18',
      instructions: [
        { step: 1, text: 'নগদ অ্যাপ খুলুন' },
        { step: 2, text: '"টাকা পাঠান" নির্বাচন করুন' },
        { step: 3, text: `সংখ্যা: ${language === 'bn' ? '01748XXXXXXX18' : '01748XXXXXXX18'}` },
        { step: 4, text: '৪০০ টাকা পাঠান' },
        { step: 5, text: 'লেনদেন সম্পূর্ণ করুন' },
      ],
      instructionsEn: [
        { step: 1, text: 'Open Nagad app' },
        { step: 2, text: 'Select "Send Money"' },
        { step: 3, text: 'Enter: 01748XXXXXXX18' },
        { step: 4, text: 'Send 400 BDT' },
        { step: 5, text: 'Confirm transaction' },
      ],
    },
    {
      id: 'rocket',
      name: 'Rocket',
      icon: '🚀',
      account: '01748****18',
      fullAccount: '01748XXXXXXX18',
      instructions: [
        { step: 1, text: 'রকেট অ্যাপ খুলুন' },
        { step: 2, text: '"পাঠান" বিকল্প নির্বাচন করুন' },
        { step: 3, text: `নম্বর: ${language === 'bn' ? '01748XXXXXXX18' : '01748XXXXXXX18'}` },
        { step: 4, text: '৪০০ টাকা পাঠান' },
        { step: 5, text: 'পিন প্রবেश করুন' },
      ],
      instructionsEn: [
        { step: 1, text: 'Open Rocket app' },
        { step: 2, text: 'Select "Send"' },
        { step: 3, text: 'Number: 01748XXXXXXX18' },
        { step: 4, text: 'Send 400 BDT' },
        { step: 5, text: 'Enter PIN' },
      ],
    },
    {
      id: 'upay',
      name: 'Upay',
      icon: '💰',
      account: '01748****18',
      fullAccount: '01748XXXXXXX18',
      instructions: [
        { step: 1, text: 'Upay অ্যাপ খুলুন' },
        { step: 2, text: '"মানি ট্রান্সফার" ট্যাপ করুন' },
        { step: 3, text: `সংখ্যা: ${language === 'bn' ? '01748XXXXXXX18' : '01748XXXXXXX18'}` },
        { step: 4, text: '৪০০ টাকা পাঠান' },
        { step: 5, text: 'লেনদেন যাচাই করুন' },
      ],
      instructionsEn: [
        { step: 1, text: 'Open Upay app' },
        { step: 2, text: 'Tap "Money Transfer"' },
        { step: 3, text: 'Number: 01748XXXXXXX18' },
        { step: 4, text: 'Send 400 BDT' },
        { step: 5, text: 'Verify transaction' },
      ],
    },
  ]

  const currentMethod = paymentMethods.find(m => m.id === selectedMethod)
  const instructions = language === 'bn' ? currentMethod?.instructions : currentMethod?.instructionsEn

  const handleCopyAccount = (account) => {
    navigator.clipboard.writeText(account)
    setCopiedAccount(account)
    setTimeout(() => setCopiedAccount(''), 2000)
  }

  const handleScreenshot = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onScreenshotChange(file)
      const url = URL.createObjectURL(file)
      setScreenshotPreview(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <p className="label-text mb-4">{t(language, 'paymentMethodSelect')}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              type="button"
              onClick={() => onPaymentMethod(method.id)}
              className={`rounded-3xl border-2 p-4 text-center transition ${
                selectedMethod === method.id
                  ? 'border-sky-500 bg-sky-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-3xl">{method.icon}</div>
              <p className="mt-2 font-semibold text-slate-900">{method.name}</p>
              <p className="mt-1 text-xs text-slate-600">{method.account}</p>
              {selectedMethod === method.id && (
                <div className="mt-2 flex items-center justify-center gap-1 text-sky-600">
                  <FaCheckCircle className="h-4 w-4" />
                  <span className="text-xs font-medium">{t(language, 'selectedLabel')}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {currentMethod && (
        <>
          {/* Step-by-Step Instructions */}
          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {language === 'bn' ? '৪০০ টাকা পাঠানোর ধাপ' : 'Steps to Send 400 BDT'}
            </h3>
            <div className="space-y-3">
              {instructions?.map((instruction) => (
                <div key={instruction.step} className="flex gap-4">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sky-500 text-white font-semibold flex-shrink-0">
                    {instruction.step}
                  </div>
                  <div className="flex items-center">
                    <p className="text-slate-700">{instruction.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Number with Copy Button */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-2">{currentMethod.name} {t(language, 'paymentNumberLabel')}</p>
                <p className="text-2xl font-bold text-slate-900 font-mono">{currentMethod.fullAccount}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyAccount(currentMethod.fullAccount)}
                className={`flex items-center gap-2 rounded-full px-4 py-3 font-medium transition ${
                  copiedAccount === currentMethod.fullAccount
                    ? 'bg-green-100 text-green-700'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FaCopy className="h-4 w-4" />
                {copiedAccount === currentMethod.fullAccount
                  ? t(language, 'copiedButton')
                  : t(language, 'copyButton')}
              </button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">⚠️ {t(language, 'importantNotice')}</span>{' '}
              {language === 'bn'
                ? 'শুধুমাত্র ৪০০ টাকা পাঠান এবং পাঠানোর পরে আপনার Transaction ID ও স্ক্রিনশট নিন।'
                : 'Send exactly 400 BDT and save the Transaction ID and screenshot after payment.'}
            </p>
          </div>

          {/* Transaction ID Input */}
          <div>
            <label className="label-text" htmlFor="transactionId">
              {language === 'bn' ? 'Transaction ID' : 'Transaction ID'}
            </label>
            <input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => onTransactionChange(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: 12N4YZ5678' : 'e.g.: 12N4YZ5678'}
              className="input-field mt-2"
            />
            <p className="mt-2 text-xs text-slate-500">
              {language === 'bn'
                ? 'পেমেন্ট সম্পন্ন হওয়ার পরে অ্যাপে যে ID দেখায় তা লিখুন।'
                : 'Enter the transaction ID shown in the app after payment.'}
            </p>
          </div>

          {/* Payment Screenshot */}
          <div>
            <label className="label-text">{language === 'bn' ? 'পেমেন্ট স্ক্রিনশট' : 'Payment Screenshot'}</label>
            <p className="text-sm text-slate-600 mb-3">
              {language === 'bn'
                ? 'সফল পেমেন্টের স্ক্রিনশট আপলোড করুন (বাধ্যতামূলক)'
                : 'Upload screenshot of successful payment (required)'}
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
              className="block w-full text-sm text-slate-600 file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-sky-50 file:text-sky-700 file:font-medium"
            />
            {screenshotPreview && (
              <div className="mt-4">
                <img src={screenshotPreview} alt="Payment screenshot preview" className="h-48 w-full rounded-3xl object-cover shadow-md" />
              </div>
            )}
          </div>

          {/* Help Support */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <FaPhone className="mt-1 h-5 w-5 text-sky-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{t(language, 'paymentHelp')}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {t(language, 'contactWhatsApp')} {' '}
                  <a href="https://wa.me/8801748XXXXXXX" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-600 hover:underline">
                    01748XXXXXXX
                  </a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
