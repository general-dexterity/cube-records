import { beforeEach, afterEach, vi } from 'vitest';

beforeEach(() => {
  // Mock all console methods to silence output during tests
  // biome-ignore lint/suspicious/noEmptyBlockStatements: Empty mock function is intentional
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  // Mock stderr.write to silence error logger output
  vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});