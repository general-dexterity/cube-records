#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
  console.log(
    `
@general-dexterity/cube-records v${packageJson.version}

A type-safe wrapper for @cubejs-client/react with automatic TypeScript generation.

Usage:
  npx @general-dexterity/cube-records <command> [options]

Commands:
  help                          Show this help message
  codegen [options]            Generate TypeScript definitions from your Cube.js schema

Examples:
  # Generate types to stdout
  npx @general-dexterity/cube-records codegen

  # Generate types to a file
  npx @general-dexterity/cube-records codegen -o src/types/cube-records.d.ts

  # Watch mode with custom endpoint
  npx @general-dexterity/cube-records codegen -b https://api.example.com/cubejs-api -w -o src/types/cube-records.d.ts

Using in your code:
  import { useCubeRecordQuery } from '@general-dexterity/cube-records';
  
  // Type-safe queries with your generated types
  const { data, isLoading, error } = useCubeRecordQuery({
    cube: 'Orders',
    measures: ['Orders.count'],
    dimensions: ['Orders.status'],
  });

For more information, visit: https://github.com/general-dexterity/cube-records
  `.trim()
  );
}

if (
  !command ||
  command === 'help' ||
  command === '--help' ||
  command === '-h'
) {
  // Check if user wants help for a specific command
  const helpTarget = args[1];
  if (helpTarget === 'codegen') {
    // Show codegen help
    const codegenBin = join(
      __dirname,
      '..',
      'node_modules',
      '.bin',
      'cube-records-codegen'
    );
    const child = spawn(codegenBin, ['--help'], {
      stdio: 'inherit',
      shell: true,
    });
    child.on('exit', (code) => {
      process.exit(code || 0);
    });
  } else {
    showHelp();
    process.exit(0);
  }
} else if (command === 'codegen') {
  const codegenBin = join(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    'cube-records-codegen'
  );
  const codegenArgs = args.slice(1);

  const child = spawn(codegenBin, codegenArgs, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
  console.error(`Unknown command: ${command}`);
  // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
  console.error(
    'Run "npx @general-dexterity/cube-records help" for usage information.'
  );
  process.exit(1);
}
