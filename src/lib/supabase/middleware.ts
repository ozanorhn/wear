import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Wenn ENV-Vars fehlen: nur die Auth-Seiten zugänglich machen, damit der User wenigstens
  // eine Fehlermeldung sieht statt einer redirect-Schleife.
  if (!url || !key) {
    const path = request.nextUrl.pathname;
    if (
      path.startsWith("/login") ||
      path.startsWith("/signup") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/reset-password") ||
      path === "/setup"
    ) {
      return NextResponse.next({ request });
    }
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/setup";
    return NextResponse.redirect(redirect);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const urlPath = request.nextUrl.clone();
  const isAuthRoute =
    urlPath.pathname.startsWith("/login") ||
    urlPath.pathname.startsWith("/signup") ||
    urlPath.pathname.startsWith("/forgot-password");
  const isPublic =
    isAuthRoute ||
    urlPath.pathname.startsWith("/reset-password") ||
    urlPath.pathname === "/manifest.webmanifest" ||
    urlPath.pathname.startsWith("/icons") ||
    urlPath.pathname === "/setup";

  if (!user && !isPublic) {
    urlPath.pathname = "/login";
    return NextResponse.redirect(urlPath);
  }

  if (user && isAuthRoute) {
    urlPath.pathname = "/wardrobe";
    return NextResponse.redirect(urlPath);
  }

  return supabaseResponse;
}
