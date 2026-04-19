import { useEffect } from 'react'
import { checkAndSendDailyNotifications } from '../services/appointmentNotifications'

/**
 * Hook to check for appointments daily and send notifications
 */
export function useAppointmentNotifications() {
  useEffect(() => {
    // Check on mount
    checkAndSendDailyNotifications()

    // Check every 6 hours
    const interval = setInterval(() => {
      checkAndSendDailyNotifications()
    }, 6 * 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])
}

/**
 * Format date for display
 */
export function formatDateBN(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString + 'T00:00:00')
  const days = ['সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার', 'রবিবার']
  const months = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ]

  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
}
