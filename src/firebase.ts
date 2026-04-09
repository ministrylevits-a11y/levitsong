import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, clearIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfigLocal from '../firebase-applet-config.json';

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

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase env variables are not configured");
}

const app = initializeApp(firebaseConfig);

const getValidFirestoreDatabaseId = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed.includes('/')) return undefined;
  return trimmed;
};

const envFirestoreDatabaseId = getValidFirestoreDatabaseId(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);
const localFirestoreDatabaseId = getValidFirestoreDatabaseId(firebaseConfigLocal?.firestoreDatabaseId);
const firestoreDatabaseId = envFirestoreDatabaseId ?? localFirestoreDatabaseId;

if (!firestoreDatabaseId) {
  console.warn('No valid Firestore database id found. Using default Firestore instance.');
} else {
  console.log('Using Firestore database id:', firestoreDatabaseId);
}

export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

clearIndexedDbPersistence(db).then(() => {
  console.log('Cleared IndexedDB persistence to fix corrupted data');
}).catch((err) => {
  console.warn('Failed to clear IndexedDB persistence:', err);
});

enableIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase persistence failed because multiple tabs are open.', err);
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase persistence is not supported by this browser.', err);
  } else {
    console.warn('Firebase persistence error:', err);
  }
});