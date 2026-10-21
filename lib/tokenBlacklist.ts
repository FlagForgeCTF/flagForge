import { Redis } from '@upstash/redis';


// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface BlacklistData {
  userId?: string;
  blacklistedAt: string;
  expiresAt: string;
}

export class TokenBlacklistService {
  /**
   * Add a session token to the blacklist
   * @param sessionToken - The NextAuth session token (plain string, not JWT)
   * @param expiresAt - When the token expires
   * @param userId - Optional user ID for tracking
   */
  static async addToBlacklist(
    sessionToken: string,
    expiresAt: Date,
    userId?: string
  ): Promise<void> {
    try {
      const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

      if (ttl > 0) {
        const data: BlacklistData = {
          userId,
          blacklistedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        await redis.setex(
          `blacklist:${sessionToken}`,
          ttl,
          JSON.stringify(data)
        );

        console.log('✅ Token blacklisted:', {
          token: sessionToken.substring(0, 20) + '...',
          userId,
          expiresIn: `${ttl}s`,
          expiresAt: expiresAt.toISOString()
        });
      } else {
        console.log('⏰ Token already expired, not adding to blacklist');
      }

    } catch (error) {
      console.error('❌ Error adding token to blacklist:', error);
      throw error;
    }
  }

  static async isBlacklisted(sessionToken: string): Promise<boolean> {
    try {
      const result = await redis.get(`blacklist:${sessionToken}`);
      const isBlacklisted = result !== null;

      if (isBlacklisted) {
        console.log('🚫 Token is blacklisted:', sessionToken.substring(0, 20) + '...');
      }

      return isBlacklisted;
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Revoke a session by its JWT ID. NextAuth re-encodes the session cookie on
   * every refresh, so the raw cookie value changes but the jti stays stable.
   */
  static async revokeJti(jti: string, expiresAt: Date, userId?: string): Promise<void> {
    // Another copy of this session may have been refreshed after `expiresAt`
    // was issued, so keep the revocation for at least one full session lifetime
    // (session.maxAge in authOptions is 1 hour).
    const minExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await TokenBlacklistService.addToBlacklist(
      `jti:${jti}`,
      expiresAt > minExpiry ? expiresAt : minExpiry,
      userId
    );
  }

  static async isJtiRevoked(jti: string): Promise<boolean> {
    return TokenBlacklistService.isBlacklisted(`jti:${jti}`);
  }

  static async removeFromBlacklist(sessionToken: string): Promise<void> {
    try {
      await redis.del(`blacklist:${sessionToken}`);
      console.log('🗑️ Token removed from blacklist:', sessionToken.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Error removing token from blacklist:', error);
      throw error;
    }
  }

  static async getBlacklistInfo(sessionToken: string): Promise<BlacklistData | null> {
    try {
      const data = await redis.get<string>(`blacklist:${sessionToken}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error getting blacklist info:', error);
      return null;
    }
  }

  static async getAllBlacklisted(): Promise<string[]> {
    try {
      const keys = await redis.keys('blacklist:*');
      return keys.map(key => key.replace('blacklist:', ''));
    } catch (error) {
      console.error('❌ Error getting all blacklisted tokens:', error);
      return [];
    }
  }

  static async getBlacklistCount(): Promise<number> {
    try {
      const keys = await redis.keys('blacklist:*');
      return keys.length;
    } catch (error) {
      console.error('❌ Error getting blacklist count:', error);
      return 0;
    }
  }

  static async cleanupExpired(): Promise<void> {
    console.log('✨ Redis auto-expires tokens, manual cleanup not needed');
  }

  /**
   * Generate a unique JTI (JWT ID)
   */
  static generateJTI(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
