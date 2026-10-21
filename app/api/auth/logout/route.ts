import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/authOptions';
import { TokenBlacklistService } from '@/lib/tokenBlacklist';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Get the raw session cookie for blacklisting
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (session) {
      console.log(`User logout: ${session.user.email} at ${new Date().toISOString()}`);
    }

    // CRITICAL: Blacklist the current token before clearing cookies
    if (sessionToken && token?.exp) {
      try {
        // Convert JWT exp (seconds) to Date
    const expiryDate = new Date(Number(token.exp) * 1000);
        
        await TokenBlacklistService.addToBlacklist(
          sessionToken,
          expiryDate,
          token.sub // user ID
        );
        if (typeof token.jti === 'string') {
          await TokenBlacklistService.revokeJti(token.jti, expiryDate, token.sub);
        }
        
        console.log(`✅ Token blacklisted for user: ${session?.user?.email || 'unknown'}`);
        console.log(`   Expires at: ${expiryDate.toISOString()}`);
      } catch (blacklistError) {
        console.error('❌ Failed to blacklist token during logout:', blacklistError);
        // Continue with logout even if blacklisting fails
      }
    } else if (sessionToken) {
      // If no expiry found, blacklist for 24 hours as fallback
      try {
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await TokenBlacklistService.addToBlacklist(
          sessionToken,
          expiryDate,
          session?.user?.id
        );
        console.log(`✅ Token blacklisted (24h default) for user: ${session?.user?.email || 'unknown'}`);
      } catch (blacklistError) {
        console.error('❌ Failed to blacklist token during logout:', blacklistError);
      }
    } else {
      console.warn('⚠️ No session token found to blacklist during logout');
    }

    const response = new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Logged out successfully',
        tokenBlacklisted: !!sessionToken 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    // Clear NextAuth cookies with proper attributes
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    // Clear session token
    response.cookies.set('next-auth.session-token', '', {
      ...cookieOptions,
      expires: new Date(0),
      maxAge: 0,
    });

    // Also clear the secure variant
    response.cookies.set('__Secure-next-auth.session-token', '', {
      ...cookieOptions,
      secure: true,
      expires: new Date(0),
      maxAge: 0,
    });

    // Clear callback URL
    response.cookies.set('next-auth.callback-url', '', {
      ...cookieOptions,
      expires: new Date(0),
      maxAge: 0,
    });

    response.cookies.set('__Secure-next-auth.callback-url', '', {
      ...cookieOptions,
      secure: true,
      expires: new Date(0),
      maxAge: 0,
    });

    // Clear CSRF token
    response.cookies.set('next-auth.csrf-token', '', {
      ...cookieOptions,
      expires: new Date(0),
      maxAge: 0,
    });

    response.cookies.set('__Secure-next-auth.csrf-token', '', {
      ...cookieOptions,
      secure: true,
      expires: new Date(0),
      maxAge: 0,
    });

    // If using custom domain, also clear with domain prefix
    if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL) {
      try {
        const domain = new URL(process.env.NEXTAUTH_URL).hostname;
        
        response.cookies.set('next-auth.session-token', '', {
          ...cookieOptions,
          domain,
          expires: new Date(0),
          maxAge: 0,
        });

        response.cookies.set('__Secure-next-auth.session-token', '', {
          ...cookieOptions,
          domain,
          secure: true,
          expires: new Date(0),
          maxAge: 0,
        });
      } catch (urlError) {
        console.error('Failed to parse NEXTAUTH_URL for domain cookies:', urlError);
      }
    }

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

// GET method redirects to login
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/authentication', request.url));
}