import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear JWT Cookie
    const cookieStore = await cookies();
    cookieStore.delete('token');

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }
}
