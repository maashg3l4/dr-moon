import { useAppStore } from '../store/useAppStore'

export function TextToSpeechButton({ text, label }) {
  const language = useAppStore(state => state.language)

  const speak = () => {
    if (!window.speechSynthesis) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      type="button"
      onClick={speak}
      className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
    >
      {label}
    </button>
  )
}
