import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { TokenBlacklistService } from '@/lib/tokenBlacklist';

export async function POST(request: NextRequest) {
  try {
    // Get the current session token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (token && sessionToken) {
      // Calculate expiration date from token
      const tokenExp = token.exp as number | undefined;
      const expiresAt = tokenExp 
        ? new Date(tokenExp * 1000) 
        : new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour

      // Blacklist the token with proper arguments
      await TokenBlacklistService.addToBlacklist(
        sessionToken,
        expiresAt,
        token.sub // userId (optional)
      );
      if (typeof token.jti === 'string') {
        await TokenBlacklistService.revokeJti(token.jti, expiresAt, token.sub);
      }
      
      console.log('✅ Token blacklisted during manual signout:', {
        userId: token.sub,
        expiresAt: expiresAt.toISOString(),
      });
    }

    // Clear all auth cookies
    const response = NextResponse.json({ 
      success: true,
      message: 'Signed out successfully' 
    });
    
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('__Secure-next-auth.csrf-token');
    response.cookies.delete('next-auth.callback-url');
    response.cookies.delete('__Secure-next-auth.callback-url');

    return response;
  } catch (error) {
    console.error('❌ Manual signout error:', error);

    let message = 'Signout failed';
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Signout failed', 
        details: message 
      },
      { status: 500 }
    );
  }
}