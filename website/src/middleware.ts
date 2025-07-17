import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_COOKIE_NAME = 'pdf-auth-token';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const { pathname } = request.nextUrl

  const isAppRoute = pathname.startsWith('/app');
  const isLoginRoute = pathname === '/login';

  if (!authToken && isAppRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (authToken && isLoginRoute) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/login'],
}
