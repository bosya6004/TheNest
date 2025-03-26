import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, isFirestoreAvailable } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
    const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const firestoreIsUp = await isFirestoreAvailable();
  if (!firestoreIsUp) {
    return NextResponse.json({ success: false, error: "Firestore is down" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { habitId, month, day, value } = body;

    if (!habitId || !month || day === undefined || value === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const docRef = db
      .collection("users")
      .doc(userId)
      .collection("habits")
      .doc(habitId)
      .collection("months")
      .doc(month);

    await docRef.set({ [day]: value }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
