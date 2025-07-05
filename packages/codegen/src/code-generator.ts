import { Console } from 'node:console';
import { DefinitionRetriever } from './definition-retriever';
import { OutputWriter } from './output-writer';
import { TypeGenerator } from './type-generator';
import type { TypeGeneratorOptions } from './types';

const debugLogger = new Console(process.stderr);

export class CodeGenerator {
  private options: TypeGeneratorOptions;
  private typeGenerator: TypeGenerator;
  private outputWriter: OutputWriter;

  constructor(options: TypeGeneratorOptions) {
    this.options = options;
    this.typeGenerator = new TypeGenerator();
    this.outputWriter = new OutputWriter();
  }

  static async run(options: TypeGeneratorOptions) {
    const generator = new CodeGenerator(options);
    await generator.run();
  }

  async run() {
    const retriever = new DefinitionRetriever(this.options.baseUrl);
    let shouldStop = false;

    while (!shouldStop) {
      shouldStop = !this.options.watch;

      // Retrieve definitions
      // biome-ignore lint/nursery/noAwaitInLoop: Watch mode requires sequential execution
      const allDefinitions = await retriever.retrieveDefinitions();
      const excludedDefinitions = this.options.exclude;

      const definitions = allDefinitions.filter(
        (definition) => !excludedDefinitions.includes(definition.name)
      );

      debugLogger.debug('Generating types...');

      // Generate types
      const declarations = this.typeGenerator.generateTypes(definitions);

      // Write output (OutputWriter handles both printing and writing)
      await this.outputWriter.writeNodes(declarations, this.options.output);

      if (shouldStop) {
        break;
      }

      debugLogger.debug('Sleeping for %d ms...', this.options.watchDelay);
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.watchDelay)
      );
    }
  }
}
