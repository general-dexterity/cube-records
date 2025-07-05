#!/usr/bin/env node

import { Console } from 'node:console';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import type { CliArgs } from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

const errorLogger = new Console(process.stderr);

const program = new Command();

program
  .name('cube-record-gen')
  .version(packageJson.version)
  .description('Generate Cube Record type definitions from a CubeJS server.')
  .option(
    '-b, --baseurl [value]',
    "Set the CubeJS server's base URL",
    'http://localhost:4000/cube-api/'
  )
  .option(
    '-w, --watch',
    'Watch for changes in the meta endpoint and regenerate the type definitions',
    false
  )
  .option(
    '-d, --duration [value]ms',
    'Set the how often we should check for changes in the meta endpoint',
    Number,
    5000
  )
  .option(
    '-o, --output [path]',
    "The path of the file where the types should be generated. Use '-' to output to stdout"
  )
  .parse(process.argv);

const args = program.opts<Partial<CliArgs>>();

if (process.env.DEBUG) {
  errorLogger.debug('cube-record-gen: Debug mode enabled');
  errorLogger.debug(
    `cube-record-gen: Arguments: ${JSON.stringify(args, null, 2)}`
  );
}

async function main() {
  const output = args.output;

  if (!output) {
    errorLogger.error(
      'cube-record-gen: Missing required option: output. Use --help for more information.'
    );
    process.exit(1);
  }

  // Placeholder for the actual code generation logic.
  return await Promise.resolve();
}

main().catch((_error) => {
  process.exit(1);
});
