import { auth } from "@clerk/nextjs/server";
import { db, isFirestoreAvailable } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const firestoreUp = await isFirestoreAvailable();
  if (!firestoreUp) return NextResponse.json({ success: false, error: "Firestore unavailable" }, { status: 503 });

  const { habits, month } = await req.json();
  if (!habits || !Array.isArray(habits) || !month) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }

  try {
    const habitData: { [habitId: string]: { [day: string]: boolean } } = {};

    for (const habitId of habits) {
      const docRef = db
        .collection("users")
        .doc(userId)
        .collection("habits")
        .doc(habitId)
        .collection("months")
        .doc(month);

      const docSnap = await docRef.get();
      habitData[habitId] = docSnap.exists ? docSnap.data() as any : {};
    }

    return NextResponse.json({ success: true, habitData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
