import { NextResponse } from "next/server";
import { isPaddleConfigured, paddlePriceId } from "@/lib/paddle";

export async function GET() {
  return NextResponse.json({
    configured: isPaddleConfigured(),
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
    env: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? "production" : "sandbox",
    prices: {
      pro: {
        monthly: paddlePriceId("pro", "monthly"),
        yearly: paddlePriceId("pro", "yearly"),
      },
      studio: {
        monthly: paddlePriceId("studio", "monthly"),
        yearly: paddlePriceId("studio", "yearly"),
      },
    },
  });
}
