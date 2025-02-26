import admin from "firebase-admin";
import { getApps, cert } from "firebase-admin/app";

// Load service account credentials from environment variables or a local file
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!getApps().length) {
  admin.initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = admin.firestore();
