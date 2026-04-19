import { create } from 'zustand'

const defaultAppointment = {
  name: '',
  phone: '',
  ageGroup: '',
  problemType: '',
  transactionId: '',
  screenshotFile: null,
  screenshotURL: '',
  timeSlot: '',
}

export const useAppStore = create(set => ({
  language: 'bn',
  currentLoad: 'green',
  appointment: defaultAppointment,
  setLanguage: language => set({ language }),
  setCurrentLoad: currentLoad => set({ currentLoad }),
  updateAppointment: appointment => set({ appointment: { ...defaultAppointment, ...appointment } }),
  resetAppointment: () => set({ appointment: defaultAppointment }),
}))
