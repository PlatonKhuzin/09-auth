import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie, serialize } from "cookie";
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

  let authenticated = Boolean(accessToken);
  const outgoingCookies: string[] = [];

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
            const { name, value, ...options } = parseSetCookie(cookie);

            if (value) {
              cookieStore.set(name, value, options);
              outgoingCookies.push(serialize(name, value, options));
            }
          }
        }

        authenticated = Boolean(cookieStore.get("accessToken")?.value);
      }
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated && (accessToken || refreshToken)) {
    outgoingCookies.length = 0;

    for (const name of ["accessToken", "refreshToken"]) {
      cookieStore.delete(name);
      outgoingCookies.push(
        serialize(name, "", {
          path: "/",
          maxAge: 0,
          expires: new Date(0),
          httpOnly: true,
          secure: request.nextUrl.protocol === "https:",
          sameSite: "lax",
        }),
      );
    }
  }

  let response: NextResponse;

  if (isPrivate && !authenticated) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublic && authenticated) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("cookie", cookieStore.toString());

    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  for (const cookie of outgoingCookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};