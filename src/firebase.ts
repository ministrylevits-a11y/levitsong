import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfigLocal from '../firebase-applet-config.json';

// Helper to get a valid configuration value, prioritizing environment variables
const getConfigValue = (envValue: string | undefined, localValue: string | undefined): string => {
  if (envValue && envValue !== 'undefined' && envValue !== 'null' && envValue.trim() !== '') {
    return envValue;
  }
  return localValue || '';
};

const firebaseConfig = {
  apiKey: getConfigValue(import.meta.env.VITE_FIREBASE_API_KEY, firebaseConfigLocal?.apiKey),
  authDomain: getConfigValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, firebaseConfigLocal?.authDomain),
  projectId: getConfigValue(import.meta.env.VITE_FIREBASE_PROJECT_ID, firebaseConfigLocal?.projectId),
  storageBucket: getConfigValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, firebaseConfigLocal?.storageBucket),
  messagingSenderId: getConfigValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, firebaseConfigLocal?.messagingSenderId),
  appId: getConfigValue(import.meta.env.VITE_FIREBASE_APP_ID, firebaseConfigLocal?.appId),
};

const rawFirestoreDatabaseId = getConfigValue(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID, firebaseConfigLocal?.firestoreDatabaseId);
const firestoreDatabaseId = rawFirestoreDatabaseId && !rawFirestoreDatabaseId.includes('/')
  ? rawFirestoreDatabaseId
  : undefined;

if (rawFirestoreDatabaseId && !firestoreDatabaseId) {
  console.warn(
    'Ignored invalid Firestore database id; use the Firestore database name, not a Realtime Database URL:',
    rawFirestoreDatabaseId
  );
}

// Validate that we have at least an API Key before initializing
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing! The app might not function correctly until environment variables are configured.");
}

const app = initializeApp(firebaseConfig);
export const db = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
export const auth = getAuth(app);

enableIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase persistence failed because multiple tabs are open.', err);
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase persistence is not supported by this browser.', err);
  } else {
    console.warn('Firebase persistence error:', err);
  }
});
