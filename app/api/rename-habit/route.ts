import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" });

  const { oldName, newName } = await req.json();
  if (!oldName || !newName || oldName === newName)
    return NextResponse.json({ success: false, error: "Invalid input" });

  try {
    const oldRef = db.collection("users").doc(userId).collection("habits").doc(oldName);
    const newRef = db.collection("users").doc(userId).collection("habits").doc(newName);

    // 1. Copy goal field
    const oldDoc = await oldRef.get();
    const goal = oldDoc.exists ? oldDoc.data()?.goal || 0 : 0;
    await newRef.set({ goal });

    // 2. Copy all months from subcollection
    const monthsSnap = await oldRef.collection("months").get();
    for (const doc of monthsSnap.docs) {
      await newRef.collection("months").doc(doc.id).set(doc.data());
    }

    // 3. Delete old habit
    for (const doc of monthsSnap.docs) {
      await oldRef.collection("months").doc(doc.id).delete();
    }
    await oldRef.delete();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to rename habit" }, { status: 500 });
  }
}
