import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { TokenBlacklistService } from '@/lib/tokenBlacklist';

export async function tokenBlacklistMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for NextAuth API routes and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return null; // Let it pass through
  }

  try {
    // Get the session token cookie
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    // If there's no session token, let NextAuth handle it
    if (!sessionToken) {
      return null;
    }

    // Check if token is blacklisted, either by raw cookie value or by its jti
    // (which survives NextAuth re-issuing the cookie)
    const decoded = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isBlacklisted =
      (await TokenBlacklistService.isBlacklisted(sessionToken)) ||
      (typeof decoded?.jti === 'string' &&
        (await TokenBlacklistService.isJtiRevoked(decoded.jti)));
    
    if (isBlacklisted) {
      console.log('🚫 Blacklisted token detected, clearing session');
      
      // Clear all auth cookies and redirect
      const response = NextResponse.redirect(new URL('/authentication', request.url));
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      response.cookies.delete('next-auth.csrf-token');
      response.cookies.delete('__Secure-next-auth.csrf-token');
      response.cookies.delete('next-auth.callback-url');
      response.cookies.delete('__Secure-next-auth.callback-url');
      
      return response;
    }

    return null;
    
  } catch (error) {
    console.error('❌ Token blacklist middleware error:', error);
    return null;
  }
}
