import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserIdFromToken } from './jwt';

/**
 * Authenticate the user and return their user ID.
 *
 * This function retrieves the JWT token from the HTTP-only cookie,
 * validates it, and returns the user ID. If authentication fails,
 * it returns an error response.
 *
 * @param _request - Optional NextRequest object (for future extensibility)
 * @returns Promise resolving to either:
 *   - `number` - The authenticated user's ID
 *   - `NextResponse` - Error response (401) if authentication fails
 *
 * @example
 * ```typescript
 * // In an API route
 * export async function GET(request: NextRequest) {
 *   const userId = await getAuthenticatedUser();
 *   if (userId instanceof NextResponse) return userId;
 *
 *   // Now use userId as a number
 *   const data = await fetchDataForUser(userId);
 *   return NextResponse.json(data);
 * }
 * ```
 */
export async function getAuthenticatedUser(
  _request?: NextRequest
): Promise<number | NextResponse> {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
