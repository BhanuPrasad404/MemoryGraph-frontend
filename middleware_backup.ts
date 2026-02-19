import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ ALWAYS allow auth-related routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') // <-- IMPORTANT (covers callback + reset)
  ) {
    return NextResponse.next();
  }

  // ✅ Check for ANY Supabase auth cookie (SSR-safe)
  const hasSupabaseSession = req.cookies
    .getAll()
    .some(cookie => cookie.name.includes('auth-token'));

  if (!hasSupabaseSession) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();

  
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
