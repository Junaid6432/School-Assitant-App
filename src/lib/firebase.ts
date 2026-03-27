import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
// Initialize Firebase - Only if API key is present to prevent build-time crashes
const app = (firebaseConfig.apiKey && (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))) as any;

// Initialize Firestore
const db = getFirestore(app);

const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics conditionally (only in browser)
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

// Enable persistence
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence failed: Multiple tabs open. Only one tab can use offline persistence.");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence is not supported by this browser.");
    }
  });
}

export { app, auth, db, storage, analytics };
