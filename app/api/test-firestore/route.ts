import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const testDoc = await db.collection("test").add({ message: "Firestore connected!" });
    return NextResponse.json({ success: true, id: testDoc.id });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage });
  }
}
