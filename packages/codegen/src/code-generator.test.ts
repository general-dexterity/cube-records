import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMock } from '../tests/utils/mock';
import { CodeGenerator } from './code-generator';
import { DefinitionRetriever } from './definition-retriever';
import { OutputWriter } from './output-writer';
import { TypeGenerator } from './type-generator';
import type { TypeGeneratorOptions } from './types';

vi.mock('./definition-retriever');
vi.mock('./output-writer');
vi.mock('./type-generator');

describe('CodeGenerator', () => {
  const mockOptions: TypeGeneratorOptions = {
    baseUrl: 'http://localhost:4000/cubejs-api',
    output: 'output.ts',
    exclude: [],
    watch: false,
    watchDelay: 5000,
  };

  const mockDefinitions = [
    {
      name: 'Orders',
      type: 'cube' as const,
      title: 'Orders',
      isVisible: true,
      public: true,
      measures: [],
      dimensions: [],
      segments: [],
      joins: ['Users'],
    },
    {
      name: 'Users',
      type: 'cube' as const,
      title: 'Users',
      isVisible: true,
      public: true,
      measures: [],
      dimensions: [],
      segments: [],
      joins: ['Orders'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('runs the code generation process', async () => {
    const mockRetrieveDefinitions = vi.fn().mockResolvedValue(mockDefinitions);
    const mockGenerateTypes = vi.fn().mockReturnValue([]);
    const mockWriteNodes = vi.fn().mockResolvedValue(undefined);

    vi.mocked(DefinitionRetriever).mockImplementation(() =>
      createMock<DefinitionRetriever>({
        retrieveDefinitions: mockRetrieveDefinitions,
      })
    );

    vi.mocked(TypeGenerator).mockImplementation(() =>
      createMock<TypeGenerator>({
        generateTypes: mockGenerateTypes,
      })
    );

    vi.mocked(OutputWriter).mockImplementation(() =>
      createMock<OutputWriter>({
        writeNodes: mockWriteNodes,
        writeOutput: vi.fn(),
      })
    );

    await CodeGenerator.run(mockOptions);

    expect(DefinitionRetriever).toHaveBeenCalledWith(mockOptions.baseUrl);
    expect(mockRetrieveDefinitions).toHaveBeenCalledTimes(1);
    expect(mockGenerateTypes).toHaveBeenCalledWith(mockDefinitions);
    expect(mockWriteNodes).toHaveBeenCalledWith([], mockOptions.output);
  });

  it('filters excluded definitions', async () => {
    const optionsWithExclude: TypeGeneratorOptions = {
      ...mockOptions,
      exclude: ['Users'],
    };

    const mockRetrieveDefinitions = vi.fn().mockResolvedValue(mockDefinitions);
    const mockGenerateTypes = vi.fn().mockReturnValue([]);
    const mockWriteNodes = vi.fn().mockResolvedValue(undefined);

    vi.mocked(DefinitionRetriever).mockImplementation(() =>
      createMock<DefinitionRetriever>({
        retrieveDefinitions: mockRetrieveDefinitions,
      })
    );

    vi.mocked(TypeGenerator).mockImplementation(() =>
      createMock<TypeGenerator>({
        generateTypes: mockGenerateTypes,
      })
    );

    vi.mocked(OutputWriter).mockImplementation(() =>
      createMock<OutputWriter>({
        writeNodes: mockWriteNodes,
        writeOutput: vi.fn(),
      })
    );

    await CodeGenerator.run(optionsWithExclude);

    expect(mockGenerateTypes).toHaveBeenCalledWith([mockDefinitions[0]]);
  });

  it('runs in watch mode', async () => {
    const optionsWithWatch: TypeGeneratorOptions = {
      ...mockOptions,
      watch: true,
      watchDelay: 100, // Small delay for testing
    };

    const mockRetrieveDefinitions = vi.fn().mockResolvedValue(mockDefinitions);
    const mockGenerateTypes = vi.fn().mockReturnValue([]);
    const mockWriteNodes = vi.fn().mockResolvedValue(undefined);

    vi.mocked(DefinitionRetriever).mockImplementation(() =>
      createMock<DefinitionRetriever>({
        retrieveDefinitions: mockRetrieveDefinitions,
      })
    );

    vi.mocked(TypeGenerator).mockImplementation(() =>
      createMock<TypeGenerator>({
        generateTypes: mockGenerateTypes,
      })
    );

    vi.mocked(OutputWriter).mockImplementation(() =>
      createMock<OutputWriter>({
        writeNodes: mockWriteNodes,
        writeOutput: vi.fn(),
      })
    );

    // Start the generator
    const generatorPromise = CodeGenerator.run(optionsWithWatch);

    // Wait for first iteration
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Stop watch mode by changing the flag
    optionsWithWatch.watch = false;

    // Wait for the generator to complete
    await generatorPromise;

    // Should be called at least once
    expect(mockRetrieveDefinitions).toHaveBeenCalled();
    expect(mockGenerateTypes).toHaveBeenCalled();
    expect(mockWriteNodes).toHaveBeenCalled();
  });

  it('handles errors during generation', async () => {
    const error = new Error('Network error');
    const mockRetrieveDefinitions = vi.fn().mockRejectedValue(error);

    vi.mocked(DefinitionRetriever).mockImplementation(() =>
      createMock<DefinitionRetriever>({
        retrieveDefinitions: mockRetrieveDefinitions,
      })
    );

    await expect(CodeGenerator.run(mockOptions)).rejects.toThrow(
      'Network error'
    );
  });

  it('creates instance with correct options', () => {
    const generator = new CodeGenerator(mockOptions) as unknown as {
      options: TypeGeneratorOptions;
      typeGenerator: TypeGenerator;
      outputWriter: OutputWriter;
    };
    expect(generator.options).toEqual(mockOptions);
    expect(generator.typeGenerator).toBeDefined();
    expect(generator.outputWriter).toBeDefined();
  });
});
