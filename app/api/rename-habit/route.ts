import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" });

  const { habitId, newName } = await req.json();
  if (!habitId || !newName) {
    return NextResponse.json({ success: false, error: "Invalid input" });
  }

  try {
    await db.collection("users").doc(userId).collection("habits").doc(habitId).update({
      name: newName,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to rename habit" }, { status: 500 });
  }
}
