// app/lib/firebaseAdmin.ts
import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing Firebase environment variables.");
}

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();

// ✅ Firestore health check function
export async function isFirestoreAvailable(): Promise<boolean> {
  try {
    await db.collection("healthCheck").doc("status").get();
    return true;
  } catch (error) {
    console.error("Firestore unavailable:", error);
    return false;
  }
}
