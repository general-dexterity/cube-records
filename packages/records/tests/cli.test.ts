import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '..', 'bin', 'cube-records.js');
const VERSION_REGEX = /\d+\.\d+\.\d+/;

function runCLI(
  args: string[]
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ stdout, stderr, code });
    });
  });
}

describe('CLI', () => {
  describe('help command', () => {
    it('shows help when no command is provided', async () => {
      const { stdout, code } = await runCLI([]);
      expect(code).toBe(0);
      expect(stdout).toContain('@general-dexterity/cube-records');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('help');
      expect(stdout).toContain('codegen');
    });

    it('shows help with help command', async () => {
      const { stdout, code } = await runCLI(['help']);
      expect(code).toBe(0);
      expect(stdout).toContain('@general-dexterity/cube-records');
      expect(stdout).toContain('Usage:');
    });

    it('shows help with --help flag', async () => {
      const { stdout, code } = await runCLI(['--help']);
      expect(code).toBe(0);
      expect(stdout).toContain('@general-dexterity/cube-records');
    });

    it('shows help with -h flag', async () => {
      const { stdout, code } = await runCLI(['-h']);
      expect(code).toBe(0);
      expect(stdout).toContain('@general-dexterity/cube-records');
    });

    it('shows codegen help with help codegen', async () => {
      const { stdout, code } = await runCLI(['help', 'codegen']);
      expect(code).toBe(0);
      expect(stdout).toContain('Generate Cube Record type definitions');
      expect(stdout).toContain('--baseUrl');
      expect(stdout).toContain('--watch');
      expect(stdout).toContain('--output');
    });
  });

  describe('codegen command', () => {
    it('shows codegen help with codegen --help', async () => {
      const { stdout, code } = await runCLI(['codegen', '--help']);
      expect(code).toBe(0);
      expect(stdout).toContain('Generate Cube Record type definitions');
      expect(stdout).toContain('--baseUrl');
    });

    it('shows version with codegen --version', async () => {
      const { stdout, code } = await runCLI(['codegen', '--version']);
      expect(code).toBe(0);
      expect(stdout).toMatch(VERSION_REGEX);
    });
  });

  describe('error handling', () => {
    it('shows error for invalid command', async () => {
      const { stderr, code } = await runCLI(['invalid-command']);
      expect(code).toBe(1);
      expect(stderr).toContain('Unknown command: invalid-command');
      expect(stderr).toContain('npx @general-dexterity/cube-records help');
    });
  });
});
