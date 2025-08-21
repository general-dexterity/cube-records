import { Console } from 'node:console';
import { writeFile } from 'node:fs/promises';
import ts from 'typescript';

const errorLogger = new Console(process.stderr);

export class OutputWriter {
  async writeNodes(nodes: ts.Statement[], path: string): Promise<void> {
    const generatedContent = this.printNodes(nodes);
    const header = this.getGeneratedFileHeader();
    const content = header + generatedContent;
    await this.writeOutput(content, path);
  }

  private getGeneratedFileHeader(): string {
    return `/**
 * This file is auto-generated. Do not edit it directly.
 * Any changes made to this file will be overwritten when regenerated.
 */

/* eslint-disable */
// @ts-nocheck

`;
  }

  async writeOutput(content: string, path: string): Promise<void> {
    if (path === '-') {
      // Output to stdout
      // biome-ignore lint/suspicious/noConsole: Output to stdout is intentional
      console.log(content);
    } else {
      // Write to file
      try {
        await writeFile(path, content, 'utf8');
      } catch (err) {
        errorLogger.error('An error occurred while writing to file:');
        errorLogger.error(err);
        throw err;
      }
    }
  }

  private printNodes(nodes: ts.Statement[]): string {
    const sourceFile = ts.createSourceFile(
      'output.ts',
      '',
      ts.ScriptTarget.Latest
    );
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

    return printer.printList(
      ts.ListFormat.MultiLine,
      ts.factory.createNodeArray(nodes),
      sourceFile
    );
  }
}
