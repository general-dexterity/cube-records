import type ts from 'typescript';
import { describe, expect, it } from 'vitest';
import type { CubeDefinitionWithRelations } from '../src/cube';
import { TypeGenerator } from '../src/type-generator';

describe('TypeGenerator', () => {
  const typeGenerator = new TypeGenerator();

  const mockCubeDefinition: CubeDefinitionWithRelations = {
    name: 'Orders',
    type: 'cube',
    title: 'Orders',
    isVisible: true,
    public: true,
    measures: [
      {
        name: 'Orders.count',
        title: 'Orders Count',
        shortTitle: 'Count',
        cumulativeTotal: false,
        cumulative: false,
        type: 'number',
        aggType: 'count',
        drillMembersGrouped: {
          measures: [],
          dimensions: [],
        },
        isVisible: true,
        public: true,
      },
    ],
    dimensions: [
      {
        name: 'Orders.status',
        title: 'Order Status',
        type: 'string',
        shortTitle: 'Status',
        suggestFilterValues: true,
        isVisible: true,
        public: true,
        primaryKey: false,
      },
    ],
    segments: [],
    joins: ['Users'],
  };

  const mockViewDefinition: CubeDefinitionWithRelations = {
    name: 'OrdersView',
    type: 'view',
    title: 'Orders View',
    isVisible: true,
    public: true,
    measures: [],
    dimensions: [
      {
        name: 'OrdersView.id',
        title: 'ID',
        type: 'number',
        shortTitle: 'ID',
        suggestFilterValues: false,
        isVisible: true,
        public: true,
        primaryKey: true,
      },
    ],
    segments: [],
    joins: [],
  };

  it('generates types for cube definitions', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(6); // 2 shared types + 1 cube interface + 3 union types
    expect(
      result.some((node) => node.name?.escapedText === 'CubeDimension')
    ).toBe(true);
    expect(
      result.some((node) => node.name?.escapedText === 'CubeMeasure')
    ).toBe(true);
    expect(
      result.some((node) => node.name?.escapedText === 'OrdersCubeModel')
    ).toBe(true);
  });

  it('generates types for view definitions', () => {
    const definitions = [mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(6); // 2 shared types + 1 view interface + 3 union types
    expect(
      result.some((node) => node.name?.escapedText === 'OrdersViewCubeView')
    ).toBe(true);
  });

  it('generates types for mixed cube and view definitions', () => {
    const definitions = [mockCubeDefinition, mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(8); // 2 shared types + 2 interfaces + 4 union types
    expect(
      result.some((node) => node.name?.escapedText === 'OrdersCubeModel')
    ).toBe(true);
    expect(
      result.some((node) => node.name?.escapedText === 'OrdersViewCubeView')
    ).toBe(true);
  });

  it('generates correct TypeScript declarations', () => {
    const definitions = [mockCubeDefinition];
    const declarations = typeGenerator.generateTypes(definitions);

    expect(declarations).toHaveLength(6);
    expect(
      declarations.some((node) => node.name?.escapedText === 'CubeDimension')
    ).toBe(true);
    expect(
      declarations.some((node) => node.name?.escapedText === 'CubeMeasure')
    ).toBe(true);
    expect(
      declarations.some((node) => node.name?.escapedText === 'OrdersCubeModel')
    ).toBe(true);
  });

  it('generates shared types correctly', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const sharedTypes = result.filter(
      (node) =>
        node.name?.escapedText === 'CubeDimension' ||
        node.name?.escapedText === 'CubeMeasure'
    );
    expect(sharedTypes).toHaveLength(2);

    // Verify that both shared types have generic type parameters
    const cubeDimension = sharedTypes.find(
      (node) => node.name?.escapedText === 'CubeDimension'
    ) as ts.InterfaceDeclaration;
    const cubeMeasure = sharedTypes.find(
      (node) => node.name?.escapedText === 'CubeMeasure'
    ) as ts.InterfaceDeclaration;

    expect(cubeDimension?.typeParameters?.length).toBe(1);
    expect(cubeMeasure?.typeParameters?.length).toBe(1);
  });

  it('generates union types correctly', () => {
    const definitions = [mockCubeDefinition, mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    expect(
      result.some((node) => node.name?.escapedText === 'CubeModelNameMap')
    ).toBe(true);
    expect(result.some((node) => node.name?.escapedText === 'CubeModel')).toBe(
      true
    );
    expect(result.some((node) => node.name?.escapedText === 'CubeView')).toBe(
      true
    );
    expect(
      result.some((node) => node.name?.escapedText === 'CubeResource')
    ).toBe(true);
  });

  it('handles empty definitions array', () => {
    const definitions: CubeDefinitionWithRelations[] = [];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(3); // 2 shared types + 1 empty name map
    expect(
      result.some((node) => node.name?.escapedText === 'CubeDimension')
    ).toBe(true);
    expect(
      result.some((node) => node.name?.escapedText === 'CubeMeasure')
    ).toBe(true);
  });

  it('handles definitions with empty measures and dimensions', () => {
    const emptyDefinition: CubeDefinitionWithRelations = {
      name: 'Empty',
      type: 'cube',
      title: 'Empty',
      isVisible: true,
      public: true,
      measures: [],
      dimensions: [],
      segments: [],
      joins: [],
    };

    const definitions = [emptyDefinition];
    const result = typeGenerator.generateTypes(definitions);

    expect(
      result.some((node) => node.name?.escapedText === 'EmptyCubeModel')
    ).toBe(true);

    // Check that the interface has the expected structure
    const emptyInterface = result.find(
      (node) => node.name?.escapedText === 'EmptyCubeModel'
    ) as ts.InterfaceDeclaration;
    expect(emptyInterface?.members?.length).toBe(5); // name, measures, dimensions, joins, segments
  });
});
