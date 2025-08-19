import { beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

  const __dirname = dirname(fileURLToPath(import.meta.url));

function runShellScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [scriptPath], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to execute script: ${error.message}`));
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

beforeAll(async () => {
  console.log('Setting up test database...');
  try {
    await runShellScript(join(__dirname, 'setup.sh'));
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}, 30000);

afterAll(async () => {
  console.log('Cleaning up test database...');
  try {
    await runShellScript(join(__dirname, 'teardown.sh'));
    console.log('Test database cleanup complete');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
    throw error;
  }
}, 30000);
