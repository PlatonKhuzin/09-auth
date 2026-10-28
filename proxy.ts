import { NextRequest, NextResponse } from "next/server";
import { parseSetCookie } from "cookie";
import { checkSession, getMe } from "@/lib/api/serverApi";

const privateRoutes = ["/notes", "/profile"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isPrivate = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isPublic = publicRoutes.includes(pathname);

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let authenticated = Boolean(accessToken);
  let cookieHeader = request.cookies.toString();

  const refreshedCookies: string[] = [];
  const requestHeaders = new Headers(request.headers);

  // Обновляем сессию, только если accessToken отсутствует.
  if (!accessToken && refreshToken) {
    try {
      const session = await checkSession(cookieHeader);

      if (session.data.success) {
        const values = new Map(
          request.cookies.getAll().map(({ name, value }) => [name, value]),
        );

        const rawCookies = session.headers["set-cookie"];

        if (rawCookies) {
          const cookieArray = Array.isArray(rawCookies)
            ? rawCookies
            : [rawCookies];

          for (const cookie of cookieArray) {
            const parsed = parseSetCookie(cookie);

            if (parsed.value) {
              values.set(parsed.name, parsed.value);
              refreshedCookies.push(cookie);
            }
          }
        }

        cookieHeader = Array.from(
          values,
          ([name, value]) => `${name}=${value}`,
        ).join("; ");

        authenticated = Boolean(values.get("accessToken"));
      }
    } catch {
      authenticated = false;
    }
  }

  // Проверяем токен. Ошибка профиля отменяет авторизацию.
  if (authenticated) {
    try {
      await getMe(cookieHeader);
      requestHeaders.set("cookie", cookieHeader);
    } catch {
      authenticated = false;
    }
  }

  let response: NextResponse;

  if (isPrivate && !authenticated) {
    response = NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isPublic && authenticated) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else {
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (authenticated) {
    for (const cookie of refreshedCookies) {
      response.headers.append("set-cookie", cookie);
    }
  } else if (accessToken || refreshToken) {
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
  }

  return response;
}

export const config = {
  matcher: ["/notes/:path*", "/profile/:path*", "/sign-in", "/sign-up"],
};