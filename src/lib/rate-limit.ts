/**
 * Simple in-memory rate limiter — no external dependencies.
 *
 * NOTE: This works correctly on traditional Node.js servers (Render, Railway, VPS).
 * On true serverless/edge (Vercel Functions), each invocation is a separate process,
 * so in-memory state doesn't persist between requests. For Vercel, replace this with
 * @upstash/ratelimit + @upstash/redis (free tier available at upstash.com).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to avoid memory leaks on long-running servers
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) store.delete(key);
    }
}, 5 * 60 * 1000);

/**
 * @param key        Identifier — typically an IP address
 * @param maxRequests  Max allowed requests in the window
 * @param windowMs   Window duration in milliseconds
 * @returns true if the request is allowed, false if rate-limited
 */
export function rateLimit(key: string, maxRequests = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (entry.count >= maxRequests) return false;

    entry.count++;
    return true;
}

/**
 * getClientIp — extracts the real client IP from Next.js request headers.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return request.headers.get('x-real-ip') ?? 'unknown';
}
