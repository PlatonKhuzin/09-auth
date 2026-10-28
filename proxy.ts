import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";
import { checkSession } from "@/lib/api/serverApi";

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
  const cookieValues = new Map(
    cookieStore.getAll().map(({ name, value }) => [name, value]),
  );
  let authenticated = Boolean(accessToken);
  let refreshedCookies: string[] = [];

  if (!accessToken && refreshToken) {
    try {
      const session = await checkSession(cookieStore.toString());
      if (session.data.success) {
        const rawCookies = session.headers["set-cookie"];
        refreshedCookies = rawCookies
          ? Array.isArray(rawCookies)
            ? rawCookies
            : [rawCookies]
          : [];
        for (const cookie of refreshedCookies) {
          const { name, value } = parseSetCookie(cookie);
          if (value) cookieValues.set(name, value);
        }
        authenticated = Boolean(cookieValues.get("accessToken"));
      }
    } catch {
      authenticated = false;
    }
  }

  const clearCookies = !authenticated && Boolean(accessToken || refreshToken);
  if (clearCookies) {
    cookieValues.delete("accessToken");
    cookieValues.delete("refreshToken");
    refreshedCookies = [];
  }

  let response: NextResponse;
  if (isPrivate && !authenticated) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublic && authenticated) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(
      "cookie",
      Array.from(cookieValues, ([name, value]) => `${name}=${value}`).join(
        "; ",
      ),
    );
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  for (const cookie of refreshedCookies) {
    const { name, value, ...options } = parseSetCookie(cookie);
    if (value) response.cookies.set(name, value, options);
  }
  if (clearCookies) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
