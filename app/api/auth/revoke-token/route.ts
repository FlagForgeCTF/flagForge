import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { TokenBlacklistService } from '@/lib/tokenBlacklist';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, expiresAt } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    if (typeof token !== 'string' || token.length > 4096) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Parse expiration date or use default (1 hour from now). Capped at the
    // session lifetime so callers can't park arbitrary long-lived keys in Redis.
    const maxExpiry = Date.now() + 60 * 60 * 1000;
    const requested = expiresAt ? new Date(expiresAt).getTime() : maxExpiry;
    const expiration = new Date(
      Number.isFinite(requested) ? Math.min(requested, maxExpiry) : maxExpiry
    );

    // Add to blacklist with proper arguments
    await TokenBlacklistService.addToBlacklist(
      token,
      expiration,
      session.user.id // userId from session
    );
    
    console.log('✅ Token revoked:', {
      userId: session.user.id,
      expiresAt: expiration.toISOString(),
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Token revoked successfully' 
    });
  } catch (error) {
    console.error('❌ Token revocation error:', error);
    
    let message = 'Failed to revoke token';
    if (error instanceof Error) {
      message = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to revoke token',
        details: message
      },
      { status: 500 }
    );
  }
}
