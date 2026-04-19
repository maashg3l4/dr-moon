# ডা. তাসদিকুল ইসলাম মুন টেলিমেডিসিন PWA

এই প্রজেক্টটি একটি মোবাইল-ফার্স্ট টেলিমেডিসিন ওয়েব অ্যাপ তৈরি করে, যা গ্রামীণ রোগীদের জন্য দ্রুত অ্যাপয়েন্টমেন্ট বুকিং, সিরিয়াল প্যানেল, লাইভ আপডেট এবং ফায়ারবেস ব্যাকএন্ড सपোর্ট করে।

## 📌 মূল ফিচার

- হোমপেজ בו বাংলা ডিফল্ট এবং ইংরেজি সোয়াচ/টগল
- ৩-ধাপে অ্যাপয়েন্টমেন্ট উইজার্ড
- bKash/Rocket পেমেন্ট নির্দেশিকা ও স্ক্রিনশট আপলোড
- সিরিয়াল প্যানেল লাইভ ও অফলাইন সহ
- Firebase Auth/Firestore/Storage/Realtime ডাটাবেস
- PWA + ইনস্টলযোগ্য ম্যানিফেস্ট
- SMS placeholder ও Twilio-ready কোড স্ট্রাকচার

## 🧰 টেক স্ট্যাক

- Frontend: React + Vite
- Styling: Tailwind CSS
- Routing: React Router
- State: Zustand
- Backend: Firebase Firestore, Storage, Realtime Database
- PWA: vite-plugin-pwa
- PDF/SMS/Video call ready: jsPDF/html2canvas/Twilio/Jitsi

## 🚀 রূপায়ন নির্দেশিকা

### 1. লোকাল ডেভেলপমেন্ট

```bash
npm install
cp .env.example .env
npm run dev
```

### 2. `.env` ফাইল

`.env` ফাইলে Firebase কনফিগারেশন যোগ করুন:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
```

### 3. ফায়ারবেস সেটআপ

1. Firebase console এ নতুন প্রজেক্ট তৈরি করুন।
2. "Add app" থেকে Web app যোগ করুন।
3. Firestore, Realtime Database এবং Storage সক্রিয় করুন।
4. Firebase config মান `.env`-এ কপি করুন।
5. `firestore.rules` এবং `storage.rules` প্রয়োগ করুন।

### 4. PWA ইনস্টলেশন

1. অ্যাপ চালু করুন `npm run dev` দিয়ে।
2. ব্রাউজারে সাইট খুলুন।
3. ব্রাউজারের ইনস্টল প্রম্পট দেখলে "Install" ক্লিক করুন।

### 5. ডিপ্লয়মেন্ট

#### Vercel

- Vercel এ রিপো কনফিগার করুন।
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: `.env` এ থাকা Firebase মান
- GitHub রিপো আপলোড করলে Vercel সরাসরি GitHub থেকে ডিপ্লয় করতে পারে।

#### GitHub সেটআপ

1. লোকাল রিপো তৈরি করুন:

```bash
git init
git add .
git commit -m "Initial commit: Dr. Moon telemedicine PWA"
```

2. GitHub এ নতুন রিপো তৈরি করে লিখুন:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

3. এখন Vercel এ এই GitHub রিপো কানেক্ট করুন এবং ডিপ্লয় করুন।

#### Firebase Hosting

- যদি Firebase Hosting ব্যবহার করতে চান:
  - `npm install -g firebase-tools`
  - `firebase login`
  - `firebase init` (Hosting + Firestore/Realtime/Storage)
  - `firebase deploy`

## 🧪 নোট

- SMS পাঠানো এখন ডামি; কনসোলে লাইভ লগ দেখাবে।
- ভিডিও কল ফিচার Jitsi-ready, অ্যাডমিন রুম লিংক তৈরি করতে প্রিপ্যার্ড।
- গুরুত্বপূর্ণ: বাস্তব পেমেন্ট গেটওয়ে যোগ করা হয়নি, শুধুমাত্র ট্রানজ্যাকশন আইডি যাচাইকরণ আছে।

## 🩺 ডক্টর প্যানেল

- ডক্টর ড্যাশবোর্ড: `/doctor`
- ডক্টর লগইন ছাড়াই সরাসরি অ্যাক্সেস করা যায়
- ডক্টর লগইন সফল হলে লোকাল বা Firestore `appointments` থেকে আজকের অ্যাপয়েন্টমেন্ট দেখাবে।
- চিকিৎসক প্রেসক্রিপশন লিখে PDF ডাউনলোড করতে পারবেন, ভিডিও কল লিংক তৈরি করতে পারবেন এবং সিরিয়াল নম্বর আপডেট করতে পারবেন।
## 👑 অ্যাডমিন প্যানেল

- অ্যাডমিন ড্যাশবোর্ড: `/admin`
- অ্যাডমিন লগইন ছাড়াই সরাসরি অ্যাক্সেস করা যায়
- অ্যাডমিন সব ডাক্তার, অ্যাপয়েন্টমেন্ট এবং সিস্টেম সেটিংস ম্যানেজ করতে পারবেন
- নতুন ডাক্তার যোগ করা, অ্যাপয়েন্টমেন্ট ডিলিট করা, পেমেন্ট স্ট্যাটাস আপডেট করা ইত্যাদি কাজ করতে পারবেন
## 📁 প্রজেক্ট ফাইল

- `src/pages/Home.jsx` — হোমপেজ
- `src/pages/AppointmentWizard.jsx` — ৩-ধাপে অ্যাপয়েন্টমেন্ট
- `src/pages/SerialPanel.jsx` — সিরিয়াল প্যানেল
- `src/firebaseConfig.js` — Firebase initialization
- `firestore.rules` ও `storage.rules` — নিরাপত্তা নিয়ম
- `vite.config.js` — PWA ও Vite সেটিংস
