import { auth } from "@clerk/nextjs/server";
import { db, isFirestoreAvailable } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const firestoreUp = await isFirestoreAvailable();
  if (!firestoreUp) return NextResponse.json({ success: false, error: "Firestore unavailable" }, { status: 503 });

  try {
    const habitsRef = db
      .collection("users")
      .doc(userId)
      .collection("habits")
      .orderBy("createdAt", "asc");

    const snapshot = await habitsRef.get();

    const habits: { id: string; name: string; goal: number }[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      habits.push({
        id: doc.id,
        name: data.name || "Untitled",
        goal: data.goal || 0,
      });
    });

    return NextResponse.json({ success: true, habits });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
