import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/more/:path*",
    "/team/:path*",
    "/help/:path*",
    "/invoices/:path*",
    "/timesheets/:path*",
    "/reports/:path*",
    "/time-tracker/:path*",
  ],
};
