import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { habitId, name, goal } = await req.json();
  if (!habitId || goal === undefined) {
    return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
  }

  try {
    await db.collection("users").doc(userId).collection("habits").doc(habitId).set(
      { goal, ...(name && { name }) },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to edit habit" }, { status: 500 });
  }
}
