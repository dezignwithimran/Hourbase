import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";

const PUBLIC_PREFIXES = ["/login", "/signup", "/forgot-password", "/auth", "/api/"];
const AUTH_TIMEOUT_MS = 800;

function isPublicPath(path: string) {
  return (
    path === "/" ||
    PUBLIC_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(prefix))
  );
}

async function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("supabase-auth-timeout")), ms);
    }),
  ]);
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const nextResponse = NextResponse.next({ request });

  if (isPublicPath(path) || !isSupabaseConfigured()) {
    return nextResponse;
  }

  let supabaseResponse = nextResponse;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let user = null;
  try {
    const result = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS);
    user = result.data.user;
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
