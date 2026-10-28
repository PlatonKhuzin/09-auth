import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";
import { checkSession, getMe } from "@/lib/api/serverApi";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const pathname = request.nextUrl.pathname;

  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPublic = publicRoutes.includes(pathname);

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let authenticated = Boolean(accessToken);

  if (!accessToken && refreshToken) {
    try {
      const session = await checkSession(cookieStore.toString());

      if (session.data.success) {
        const rawCookies = session.headers["set-cookie"];

        if (rawCookies) {
          const cookieArray = Array.isArray(rawCookies)
            ? rawCookies
            : [rawCookies];

          for (const cookie of cookieArray) {
            const parsed = parseSetCookie(cookie);

            if (parsed.value) {
              cookieStore.set(parsed.name, parsed.value, parsed);
            }
          }
        }

        authenticated = Boolean(cookieStore.get("accessToken")?.value);
      }
    } catch {
      authenticated = false;
    }
  }

  if (authenticated) {
    try {
      await getMe(cookieStore.toString());
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated && (accessToken || refreshToken)) {
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
  }

  if (isPrivate && !authenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isPublic && authenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", cookieStore.toString());

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};