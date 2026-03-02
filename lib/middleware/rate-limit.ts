/**
 * In-memory sliding window rate limiter.
 * Production'da Redis tabanlı bir çözüme geçilebilir.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Her 5 dakikada bir eski kayıtları temizle
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

interface RateLimitOptions {
  /** Zaman penceresi (milisaniye). Varsayılan: 60000 (1 dakika) */
  windowMs?: number;
  /** Pencere içindeki maksimum istek. Varsayılan: 30 */
  maxRequests?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

/**
 * Belirli bir anahtar (genellikle user ID) için rate limit kontrolü yapar.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { windowMs = 60_000, maxRequests = 30 } = options;
  const now = Date.now();

  cleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Pencere dışındaki zaman damgalarını kaldır
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Rate limit kontrolü yapıp, aşılmışsa hazır Response döner.
 *
 * Kullanım:
 * ```ts
 * const limited = applyRateLimit(user.id, { maxRequests: 20 });
 * if (limited) return limited;
 * ```
 */
export function applyRateLimit(
  key: string,
  options: RateLimitOptions = {}
): Response | null {
  const result = checkRateLimit(key, options);

  if (!result.allowed) {
    return Response.json(
      {
        error: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(result.resetMs / 1000).toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
