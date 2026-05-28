import { describe, it, expect } from 'vitest';
import { sanitizeMentions, sanitizeTitle } from '../src/ui/responseHandler.js';

describe('sanitizeMentions', () => {
  it('escapes @everyone', () => {
    expect(sanitizeMentions('hello @everyone')).toBe('hello @\u200Beveryone');
  });

  it('escapes @here', () => {
    expect(sanitizeMentions('hi @here')).toBe('hi @\u200Bhere');
  });

  it('handles empty/null input', () => {
    expect(sanitizeMentions('')).toBe('');
    expect(sanitizeMentions(null as any)).toBe('');
    expect(sanitizeMentions(undefined as any)).toBe('');
  });

  it('does not modify normal text', () => {
    expect(sanitizeMentions('hello world 123')).toBe('hello world 123');
  });
});

describe('sanitizeTitle', () => {
  it('removes markdown headers', () => {
    expect(sanitizeTitle('## Hello World')).toBe('Hello World');
  });

  it('sanitizes mentions in title', () => {
    const result = sanitizeTitle('@everyone look');
    expect(result).not.toContain('@everyone');
    expect(result).toContain('everyone look');
  });

  it('uses fallback for empty title', () => {
    expect(sanitizeTitle('', 'Default')).toBe('Default');
  });
});
