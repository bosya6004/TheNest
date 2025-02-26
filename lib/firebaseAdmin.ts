import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

// Ensure environment variables are properly set
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing Firebase environment variables.");
}

// Initialize Firebase Admin if it's not already initialized
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure multiline keys work correctly
    }),
  });
}

// Export Firestore instance
export const db = admin.firestore();
