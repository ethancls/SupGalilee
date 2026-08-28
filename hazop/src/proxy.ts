import { NextRequest, NextResponse } from 'next/server';
import { proxyLogger } from './lib/logger';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

// Auth pages that logged-in users should be redirected away from
const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes API qui nécessitent une authenppntification
const protectedApiPrefixes = ['/api/'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  proxyLogger.debug(`Request to ${pathname}`, { hasSession: !!sessionToken });

  // Redirect authenticated users away from auth pages
  if (sessionToken && AUTH_PAGES.some(page => pathname === page || pathname.startsWith(page + '/'))) {
    proxyLogger.debug(`Redirecting authenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next();
  }

  if (!sessionToken) {
    // Redirect to login for pages, return 401 for API routes
    if (protectedApiPrefixes.some(prefix => pathname.startsWith(prefix))) {
      proxyLogger.debug(`No session for API route ${pathname}, returning 401`);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    proxyLogger.debug(`No session, redirecting from ${pathname} to /login`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
