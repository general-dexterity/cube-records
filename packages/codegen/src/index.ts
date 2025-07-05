#!/usr/bin/env node

import { Console } from 'node:console';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { CodeGenerator } from './code-generator';
import type { CliArgs, TypeGeneratorOptions } from './types';
import { isNil } from './utils';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

const errorLogger = new Console(process.stderr);

const program = new Command();

const defaults: CliArgs = {
  baseUrl: 'http://localhost:4000/cubejs-api',
  watch: false,
  delay: 5000,
  exclude: '',
  viewsOnly: false,
  output: '-',
};

program
  .name('cube-record-gen')
  .version(packageJson.version)
  .description('Generate Cube Record type definitions from a CubeJS server.')
  .option(
    '-b, --baseUrl [value]',
    "Set the CubeJS server's base URL",
    defaults.baseUrl
  )
  .option(
    '-w, --watch',
    'Watch for changes in the meta endpoint and regenerate the type definitions',
    defaults.watch
  )
  .option(
    '-d, --duration [value]ms',
    'Set the how often we should check for changes in the meta endpoint',
    Number,
    defaults.delay
  )
  .option(
    '-o, --output [path]',
    "The path of the file where the types should be generated. Use '-' to output to stdout",
    defaults.output
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
  try {
    const output = args.output;

    if (isNil(output)) {
      errorLogger.error(
        'cube-type-sync: Missing required option: output. Use --help for more information.'
      );
      process.exit(1);
    }

    const options: TypeGeneratorOptions = {
      ...args,
      output,
      baseUrl: args.baseUrl ?? defaults.baseUrl,
      exclude: args.exclude?.split(',') ?? [],
      watchDelay: args.delay ?? defaults.delay,
      watch: args.watch ?? defaults.watch,
    };

    // Remove debug output
    // console.table(options);

    await CodeGenerator.run(options);
  } catch (error) {
    errorLogger.error('An error occurred while generating types: ');
    errorLogger.error(error);

    errorLogger.error('CLI options: ');
    errorLogger.table(args);
    process.exit(1);
  }
}

main().catch((_error) => {
  process.exit(1);
});
