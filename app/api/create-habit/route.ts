import { auth } from "@clerk/nextjs/server";
import { db, isFirestoreAvailable } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import admin from "firebase-admin";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const firestoreUp = await isFirestoreAvailable();
  if (!firestoreUp) return NextResponse.json({ success: false, error: "Firestore is down" }, { status: 503 });

  const { name, goal } = await req.json();
  if (!name || goal === undefined) {
    return NextResponse.json({ success: false, error: "Missing habit data" }, { status: 400 });
  }

  try {
    const newHabitRef = db.collection("users").doc(userId).collection("habits").doc();
    const habitId = newHabitRef.id;

    await newHabitRef.set({
      name,
      goal,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: habitId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
