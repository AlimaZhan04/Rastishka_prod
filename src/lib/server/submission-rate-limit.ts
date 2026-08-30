import "server-only";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 8;
const attempts = new Map<string, number[]>();

/**
 * Process-local abuse protection. It is useful in a single instance today; when the project
 * is scaled horizontally, replace this store with a shared TTL-backed rate limiter.
 */
export function allowApplicationSubmission(identifier: string, now = Date.now()): boolean {
  const activeAttempts = (attempts.get(identifier) ?? []).filter((at) => now - at < WINDOW_MS);
  if (activeAttempts.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    attempts.set(identifier, activeAttempts);
    return false;
  }

  activeAttempts.push(now);
  attempts.set(identifier, activeAttempts);
  return true;
}
