import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth/jwt';

// Define protected routes
const protectedRoutes = ['/dashboard', '/profile'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip middleware for public routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Extract JWT from Cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Redirect to login page if no token
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Verify JWT
  const userId = await getUserIdFromToken(token);

  if (!userId) {
    // Redirect to login page if token is invalid
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Add user ID to request headers for use in server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(userId));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
