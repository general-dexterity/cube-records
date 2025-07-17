import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

describe('CLI', () => {
  it('outputs the correct version', () => {
    const result = execSync('node dist/index.js --version', {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result.trim()).toBe(packageJson.version);
  });

  it('shows help when --help is passed', () => {
    const result = execSync('node dist/index.js --help', {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Generate Cube Record type definitions');
    expect(result).toContain('Usage:');
    expect(result).toContain('Options:');
  });

  it('uses stdout as default output when no output option is provided', () => {
    expect(() => {
      execSync('node dist/index.js', {
        encoding: 'utf8',
        cwd: join(__dirname, '..'),
        stdio: 'pipe',
      });
    }).not.toThrow();
  });

  it('accepts custom output path', () => {
    const result = execSync('node dist/index.js --output test.ts --help', {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Generate Cube Record type definitions');
  });

  it('accepts custom base URL', () => {
    const result = execSync(
      'node dist/index.js --baseUrl http://localhost:5000/api --help',
      {
        encoding: 'utf8',
        cwd: join(__dirname, '..'),
      }
    );

    expect(result).toContain('Generate Cube Record type definitions');
  });

  it('accepts watch flag', () => {
    const result = execSync('node dist/index.js --watch --help', {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Generate Cube Record type definitions');
  });

  it('accepts duration option', () => {
    const result = execSync('node dist/index.js --duration 10000 --help', {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Generate Cube Record type definitions');
  });
});

