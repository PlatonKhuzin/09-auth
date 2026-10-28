import { NextRequest, NextResponse } from "next/server";
import { parseSetCookie } from "cookie";
import { checkSession, getMe } from "@/lib/api/serverApi";
const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isPublic = publicRoutes.includes(pathname);
  const requestHeaders = new Headers(request.headers);
  let authenticated = false;
  const refreshed: string[] = [];
  if (
    request.cookies.has("accessToken") ||
    request.cookies.has("refreshToken")
  ) {
    try {
      const session = await checkSession(request.cookies.toString());
      if (session.data.success) {
        const values = new Map(
          request.cookies.getAll().map(({ name, value }) => [name, value]),
        );
        const raw = session.headers["set-cookie"];
        if (raw)
          for (const value of Array.isArray(raw) ? raw : [raw]) {
            const parsed = parseSetCookie(value);
            if (parsed.value) {
              values.set(parsed.name, parsed.value);
              refreshed.push(value);
            }
          }
        const cookieHeader = Array.from(
          values,
          ([name, value]) => `${name}=${value}`,
        ).join("; ");
        await getMe(cookieHeader);
        requestHeaders.set("cookie", cookieHeader);
        authenticated = true;
      }
    } catch {
      authenticated = false;
    }
  }
  let response: NextResponse;
  if (isPrivate && !authenticated)
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  else if (isPublic && authenticated)
    response = NextResponse.redirect(new URL("/profile", request.url));
  else response = NextResponse.next({ request: { headers: requestHeaders } });
  if (authenticated) {
    for (const value of refreshed) response.headers.append("set-cookie", value);
  } else if (
    request.cookies.has("accessToken") ||
    request.cookies.has("refreshToken")
  ) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }
  return response;
}
export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};
