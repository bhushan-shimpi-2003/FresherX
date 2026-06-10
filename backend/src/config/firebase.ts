import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import * as dotenv from 'dotenv';
dotenv.config();

let isInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const serviceAccountJson = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({
      credential: cert(serviceAccount),
    });
    isInitialized = true;
    console.log('Firebase Admin initialized successfully from BASE64');
  } else {
    console.warn('Firebase credentials not found. Push notifications will not work.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export const firebaseAdmin = admin;
export const isFirebaseInitialized = isInitialized;
