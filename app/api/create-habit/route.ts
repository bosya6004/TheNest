import { auth } from "@clerk/nextjs/server";
import { db, isFirestoreAvailable } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const firestoreUp = await isFirestoreAvailable();
  if (!firestoreUp) {
    return NextResponse.json({ success: false, error: "Firestore is down" }, { status: 503 });
  }

  const { habitId, goal } = await req.json();
  if (!habitId) {
    return NextResponse.json({ success: false, error: "Missing habitId" }, { status: 400 });
  }

  try {
    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("habits")
      .doc(habitId);

    await docRef.set({ goal: goal || 0 }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
