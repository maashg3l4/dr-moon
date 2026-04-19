import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { firestore } from '../firebaseConfig'

/**
 * Save appointment to Firestore and schedule notification
 */
export async function saveAppointment(appointmentData) {
  if (!firestore) {
    console.error('Firestore not configured')
    return null
  }

  try {
    const appointmentsRef = collection(firestore, 'appointments')
    const docRef = await addDoc(appointmentsRef, {
      ...appointmentData,
      createdAt: new Date(),
      notificationSent: false,
      status: 'scheduled',
    })

    // Schedule notification for appointment day
    scheduleNotification(appointmentData.phone, appointmentData.appointmentDate, appointmentData.name)

    return docRef.id
  } catch (error) {
    console.error('Error saving appointment:', error)
    throw error
  }
}

/**
 * Send SMS reminder via backend
 */
export async function sendSMSReminder(phoneNumber, patientName) {
  try {
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phoneNumber,
        message: `আপনার ডা. তাসদিকুল ইসলাম মুনের সাথে আজ অ্যাপয়েন্টমেন্ট নির্ধারিত আছে। সময়মতো যোগাযোগ করুন। (ধন্যবাদ)`,
      }),
    })
    return response.ok
  } catch (error) {
    console.error('SMS send failed:', error)
    return false
  }
}

/**
 * Schedule notification for appointment day
 */
function scheduleNotification(phone, appointmentDate, patientName) {
  // Store in localStorage for client-side check
  const scheduledNotifications = JSON.parse(localStorage.getItem('drmoon-notifications') || '[]')
  scheduledNotifications.push({
    phone,
    appointmentDate,
    patientName,
    scheduledAt: new Date().toISOString(),
  })
  localStorage.setItem('drmoon-notifications', JSON.stringify(scheduledNotifications))
}

/**
 * Check and send notifications for today's appointments
 */
export async function checkAndSendDailyNotifications() {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // Query Firestore for today's appointments
    const appointmentsRef = collection(firestore, 'appointments')
    const q = query(
      appointmentsRef,
      where('appointmentDate', '==', today),
      where('notificationSent', '==', false),
    )

    const snapshot = await getDocs(q)

    for (const docSnapshot of snapshot.docs) {
      const appointment = docSnapshot.data()

      // Send SMS
      const smsSent = await sendSMSReminder(appointment.phone, appointment.name)

      if (smsSent) {
        // Mark as notified
        await updateDoc(doc(firestore, 'appointments', docSnapshot.id), {
          notificationSent: true,
          notificationSentAt: new Date(),
        })
      }
    }

    console.log(`Checked notifications for ${today}`)
  } catch (error) {
    console.error('Error checking notifications:', error)
  }
}

/**
 * Get upcoming appointments for a phone number
 */
export async function getAppointmentsForPhone(phone) {
  if (!firestore) return []

  try {
    const appointmentsRef = collection(firestore, 'appointments')
    const q = query(appointmentsRef, where('phone', '==', phone))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
}
