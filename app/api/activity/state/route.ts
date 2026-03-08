import { NextResponse } from "next/server"
import { getFocusState } from "@/lib/demo-activity-store"

export async function GET() {
  return NextResponse.json({ focusState: getFocusState() })
}
