import { Console } from 'node:console';
import { writeFile } from 'node:fs/promises';
import ts from 'typescript';

const errorLogger = new Console(process.stderr);

export class OutputWriter {
  async writeNodes(nodes: ts.Declaration[], path: string): Promise<void> {
    const content = this.printNodes(nodes);
    await this.writeOutput(content, path);
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

  private printNodes(nodes: ts.Declaration[]): string {
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
