import { useAppStore } from '../store/useAppStore'
import { t } from '../i18n'

export default function LanguageSwitcher() {
  const language = useAppStore(state => state.language)
  const setLanguage = useAppStore(state => state.setLanguage)
  const nextLanguage = language === 'bn' ? 'en' : 'bn'

  return (
    <button
      type="button"
      onClick={() => setLanguage(nextLanguage)}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      {language === 'bn' ? 'English' : 'বাংলা'}
    </button>
  )
}
