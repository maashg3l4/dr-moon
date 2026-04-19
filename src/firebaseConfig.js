import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyKeyForDevelopment1234567890',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dr-moon.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dr-moon-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dr-moon.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef1234567890',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://dr-moon-demo.firebaseio.com',
}

let app
let auth
let firestore
let storage
let realtime

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  firestore = getFirestore(app)
  storage = getStorage(app)
  realtime = getDatabase(app)
} catch (error) {
  console.warn('Firebase initialization warning (dev mode):', error.message)
  app = { name: 'dev-mode' }
  auth = null
  firestore = null
  storage = null
  realtime = null
}

export { app, auth, firestore, storage, realtime }
