import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAyK3jgOTFT1B6-Vt85wxc_2aaGLUlU738',
  authDomain: 'su-drink.firebaseapp.com',
  projectId: 'su-drink',
  storageBucket: 'su-drink.appspot.com',
  messagingSenderId: '837980448290',
  appId: '1:837980448290:web:e598018c49a4b238b5cc7b',
  measurementId: 'G-4FGC538PQR',
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
