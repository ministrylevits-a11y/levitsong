import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, clearIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase env variables are not configured");
}

const app = initializeApp(firebaseConfig);

const rawFirestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
const firestoreDatabaseId = rawFirestoreDatabaseId && !rawFirestoreDatabaseId.includes('/')
  ? rawFirestoreDatabaseId
  : undefined;

if (rawFirestoreDatabaseId && !firestoreDatabaseId) {
  console.warn(
    'Ignored invalid Firestore database id; use the Firestore database name, not a Realtime Database URL:',
    rawFirestoreDatabaseId
  );
}

export const db = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Clear any corrupted IndexedDB persistence first
clearIndexedDbPersistence(db).then(() => {
  console.log('Cleared IndexedDB persistence to fix corrupted data');
}).catch((err) => {
  console.warn('Failed to clear IndexedDB persistence:', err);
});

// Enable IndexedDB persistence
enableIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase persistence failed because multiple tabs are open.', err);
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase persistence is not supported by this browser.', err);
  } else {
    console.warn('Firebase persistence error:', err);
  }
});