import { NextResponse } from "next/server";

const UPSTREAM = "https://backend.rslotto.com/api/pages/results/";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      headers: { Accept: "application/json" },
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: "upstream_failed", message: String(e) }, { status: 502 });
  }
}
