import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedRoutes = [
  '/api/admin',
  '/roles/developers/admins',
  '/api/badges',
  '/api/badge-templates',
  '/resources/upload',
];

const adminOnlyRoutes = [
  '/api/admin',
  '/roles/developers/admins',
  '/api/badges',
  '/api/badge-templates',
  '/resources/upload',
];

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Removed sensitive logging
  // console.log("🧭 Admin Middleware Check:", { ... });

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = new URL('/authentication', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  const isAdminRoute = adminOnlyRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    const role = (token.role as string | undefined) || 'User';
    const isAdmin = role === 'Admin';
    
    // Removed sensitive logging
    // console.log("🔐 Authorization Check:", { ... });

    if (!isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'Admin privileges required',
            isAdmin: false,
          },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', token.sub || '');
  requestHeaders.set('x-user-role', (token.role as string) || 'User');
  requestHeaders.set('x-user-email', token.email || '');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
