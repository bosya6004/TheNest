import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { habitId } = await req.json();
  if (!habitId) return NextResponse.json({ success: false, error: "Missing habitId" }, { status: 400 });

  try {
    await db.collection("users").doc(userId).collection("habits").doc(habitId).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to delete habit" }, { status: 500 });
  }
}
