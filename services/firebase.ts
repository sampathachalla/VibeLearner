// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABbqMcAPogUJA6Ogg_IEx4FPgtBEKa3Mw",
  authDomain: "vibelearner-f264f.firebaseapp.com",
  projectId: "vibelearner-f264f",
  storageBucket: "vibelearner-f264f.appspot.com",
  messagingSenderId: "376403002035",
  appId: "1:376403002035:web:890ae346f4513695a466c6",
  measurementId: "G-GZJHRXJL0L"
};

// Initialize Firebase (guard against re-init during HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistent storage for React Native
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// Initialize Firestore once (RN: enable long polling). Guard for HMR reloads.
let db: any;
const g: any = global as any;
if (g.__FIREBASE_DB__) {
  db = g.__FIREBASE_DB__;
} else {
  db = initializeFirestore(app, { experimentalForceLongPolling: true });
  g.__FIREBASE_DB__ = db;
}

export { app, auth, db };
