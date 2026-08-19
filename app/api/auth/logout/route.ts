import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET(request: Request) {
  await destroySession();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
