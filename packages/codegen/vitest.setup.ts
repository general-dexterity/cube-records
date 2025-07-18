import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  // Mock all console methods to silence output during tests
  vi.spyOn(console, 'log').mockImplementation(vi.fn());
  vi.spyOn(console, 'error').mockImplementation(vi.fn());
  vi.spyOn(console, 'warn').mockImplementation(vi.fn());
  vi.spyOn(console, 'info').mockImplementation(vi.fn());
  vi.spyOn(console, 'debug').mockImplementation(vi.fn());
  // Mock stderr.write to silence error logger output
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});
