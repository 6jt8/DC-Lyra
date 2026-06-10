import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit } from '../src/utils/rateLimit.js';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows first command', () => {
    const result = checkRateLimit('user1', 3, 5000);
    expect(result.allowed).toBe(true);
  });

  it('blocks after max commands in window', () => {
    checkRateLimit('user2', 2, 5000);
    checkRateLimit('user2', 2, 5000);
    const result = checkRateLimit('user2', 2, 5000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('allows again after window expires', () => {
    checkRateLimit('user3', 2, 1000);
    checkRateLimit('user3', 2, 1000);
    const blocked = checkRateLimit('user3', 2, 1000);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1500);
    const allowed = checkRateLimit('user3', 2, 1000);
    expect(allowed.allowed).toBe(true);
  });

  it('tracks different users independently', () => {
    checkRateLimit('userA', 1, 5000);
    const blockedA = checkRateLimit('userA', 1, 5000);
    const allowedB = checkRateLimit('userB', 1, 5000);
    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});
