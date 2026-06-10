import { describe, it, expect } from 'vitest';
import { shouldSuppressError } from '../src/utils/errorHandler.js';

describe('shouldSuppressError', () => {
  it('returns false for null/undefined', () => {
    expect(shouldSuppressError(null)).toBe(false);
    expect(shouldSuppressError(undefined)).toBe(false);
  });

  it('suppresses known Lavalink errors', () => {
    expect(shouldSuppressError(new Error('track.info is not found'))).toBe(true);
    expect(shouldSuppressError(new Error('player.restart is not a function'))).toBe(true);
    expect(shouldSuppressError(new Error('DAVE encryption error'))).toBe(true);
  });

  it('suppresses network errors by code', () => {
    const err: any = new Error('connection failed');
    err.cause = { code: 'ECONNRESET' };
    expect(shouldSuppressError(err)).toBe(true);
  });

  it('suppresses network errors by message', () => {
    expect(shouldSuppressError(new Error('fetch failed'))).toBe(true);
    expect(shouldSuppressError(new Error('Connect Timeout'))).toBe(true);
  });

  it('does not suppress generic errors', () => {
    expect(shouldSuppressError(new Error('something weird happened'))).toBe(false);
    expect(shouldSuppressError(new Error('cannot read property x of undefined'))).toBe(false);
  });
});
