import { existsSync } from 'node:fs';
import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OutputWriter } from './output-writer';

describe('OutputWriter', () => {
  const outputWriter = new OutputWriter();
  const testContent = 'interface Test {\n  name: string;\n}';
  const testFilePath = join(process.cwd(), 'test-output.ts');

  beforeEach(() => {
    // Mock console.log to capture stdout output
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Empty mock function is intentional
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    // Clean up test file if it exists
    if (existsSync(testFilePath)) {
      await unlink(testFilePath);
    }
    vi.restoreAllMocks();
  });

  it('writes content to stdout when path is "-"', async () => {
    await outputWriter.writeOutput(testContent, '-');

    // biome-ignore lint/suspicious/noConsole: Testing console output is the purpose of this test
    expect(console.log).toHaveBeenCalledWith(testContent);
  });

  it('writes content to file when path is provided', async () => {
    await outputWriter.writeOutput(testContent, testFilePath);

    expect(existsSync(testFilePath)).toBe(true);
    const fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe(testContent);
  });

  it('handles empty content', async () => {
    const emptyContent = '';
    await outputWriter.writeOutput(emptyContent, testFilePath);

    expect(existsSync(testFilePath)).toBe(true);
    const fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe('');
  });

  it('handles UTF-8 content correctly', async () => {
    const utf8Content =
      'interface Test {\n  emoji: "🚀";\n  unicode: "héllo";\n}';
    await outputWriter.writeOutput(utf8Content, testFilePath);

    expect(existsSync(testFilePath)).toBe(true);
    const fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe(utf8Content);
  });

  it('throws error when file write fails', async () => {
    const invalidPath = '/nonexistent/directory/file.ts';

    await expect(
      outputWriter.writeOutput(testContent, invalidPath)
    ).rejects.toThrow();
  });

  it('overwrites existing file content', async () => {
    // First write
    await outputWriter.writeOutput('original content', testFilePath);
    let fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe('original content');

    // Second write (overwrite)
    await outputWriter.writeOutput(testContent, testFilePath);
    fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe(testContent);
  });

  it('handles large content', async () => {
    const largeContent =
      'interface Test {\n' +
      Array.from({ length: 1000 }, (_, i) => `  prop${i}: string;`).join('\n') +
      '\n}';

    await outputWriter.writeOutput(largeContent, testFilePath);

    expect(existsSync(testFilePath)).toBe(true);
    const fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe(largeContent);
  });

  it('writes TypeScript nodes to file', async () => {
    // Create a simple TypeScript interface declaration
    const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
      [],
      ts.factory.createIdentifier('TestInterface'),
      [],
      undefined,
      [
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier('name'),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        ),
      ]
    );

    const nodes = [interfaceDeclaration];
    await outputWriter.writeNodes(nodes, testFilePath);

    expect(existsSync(testFilePath)).toBe(true);
    const fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toContain('interface TestInterface');
    expect(fileContent).toContain('name: string');
  });

  it('writes TypeScript nodes to stdout', async () => {
    const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
      [],
      ts.factory.createIdentifier('TestInterface'),
      [],
      undefined,
      [
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier('name'),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        ),
      ]
    );

    const nodes = [interfaceDeclaration];
    await outputWriter.writeNodes(nodes, '-');

    // biome-ignore lint/suspicious/noConsole: Testing console output is the purpose of this test
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('interface TestInterface')
    );
  });

  it('handles empty TypeScript nodes array', async () => {
    const nodes: ts.Declaration[] = [];
    await outputWriter.writeNodes(nodes, testFilePath);

    expect(existsSync(testFilePath)).toBe(true);
    const fileContent = await readFile(testFilePath, 'utf8');
    expect(fileContent).toBe('');
  });
});

