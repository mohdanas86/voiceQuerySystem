/**
 * rateLimitRedis.ts — Redis-based sliding window rate limiter using Upstash.
 * Ulavi Technologies
 */

// ── SERVER ONLY ───────────────────────────────────────────────────────────────
// This file runs on the server (Upstash Redis API client). Rules:
// 1. Do NOT import browser APIs.
// 2. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must NOT have NEXT_PUBLIC_ prefix.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface RateLimiterInterface {
  limit: (ip: string) => Promise<RateLimitResult>;
}

let queryRateLimiter: RateLimiterInterface;
let transcribeRateLimiter: RateLimiterInterface;

if (hasRedisConfig) {
  // Initialize the Upstash Redis client.
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  /**
   * Rate limiter for query submissions.
   * Limits: 5 requests per IP address per 10 minutes.
   * Uses sliding window strategy.
   */
  queryRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'vb:queries',
  });

  /**
   * Rate limiter for transcription requests.
   * Limits: 10 requests per IP address per 10 minutes.
   * Prevents expensive AssemblyAI abuse.
   */
  transcribeRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    analytics: true,
    prefix: 'vb:transcribe',
  });
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("[RateLimit] Upstash Redis credentials missing. Using local in-memory fallback rate limiter.");
  }

  class InMemoryRateLimiter implements RateLimiterInterface {
    private max: number;
    private windowMs: number;
    private requests = new Map<string, number[]>();

    constructor(max: number, windowMs: number) {
      this.max = max;
      this.windowMs = windowMs;
    }

    async limit(ip: string): Promise<RateLimitResult> {
      const now = Date.now();
      const windowStart = now - this.windowMs;

      let timestamps = this.requests.get(ip) ?? [];
      timestamps = timestamps.filter(t => t > windowStart);

      if (timestamps.length >= this.max) {
        const reset = (timestamps[0] ?? now) + this.windowMs;
        return {
          success: false,
          limit: this.max,
          remaining: 0,
          reset,
        };
      }

      timestamps.push(now);
      this.requests.set(ip, timestamps);

      return {
        success: true,
        limit: this.max,
        remaining: this.max - timestamps.length,
        reset: now + this.windowMs,
      };
    }
  }

  queryRateLimiter = new InMemoryRateLimiter(5, 10 * 60 * 1000);
  transcribeRateLimiter = new InMemoryRateLimiter(10, 10 * 60 * 1000);
}

export { queryRateLimiter, transcribeRateLimiter };
