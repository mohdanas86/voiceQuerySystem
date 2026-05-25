/**
 * Simple in-memory sliding-window rate limiter.
 * Works per-IP across a single Next.js server process.
 * For multi-instance deployments, swap the Map for Redis.
 */

interface Window {
    count: number;
    resetAt: number; // unix ms
}

const store = new Map<string, Window>();

/** Returns true if the request is WITHIN the allowed limit (not rate-limited). */
export function checkRateLimit(
    key: string,
    options: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const win = store.get(key);

    if (!win || now >= win.resetAt) {
        // New window
        const resetAt = now + options.windowMs;
        store.set(key, { count: 1, resetAt });
        return { allowed: true, remaining: options.limit - 1, resetAt };
    }

    if (win.count >= options.limit) {
        return { allowed: false, remaining: 0, resetAt: win.resetAt };
    }

    win.count += 1;
    return { allowed: true, remaining: options.limit - win.count, resetAt: win.resetAt };
}

// Periodically purge expired windows to prevent memory leaks.
// Only register the interval once (guard against hot-reload in dev).
declare global {
    var __rateLimitCleanup: ReturnType<typeof setInterval> | undefined;
}
if (!globalThis.__rateLimitCleanup) {
    globalThis.__rateLimitCleanup = setInterval(() => {
        const now = Date.now();
        for (const [key, win] of store.entries()) {
            if (now >= win.resetAt) store.delete(key);
        }
    }, 60_000);
}
