import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth/jwt';

// Define public routes that bypass authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/send-code',
  '/api/auth/reset-password',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes to proceed without authentication
  if (isPublicRoute) {
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

// Match all routes including API routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
