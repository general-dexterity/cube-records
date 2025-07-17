import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import type { CubeDefinitionWithRelations } from './cube';
import { TypeGenerator } from './type-generator';

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

  it('generates module augmentation for cube definitions', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(3); // import + module declaration + export

    // Check for import declaration
    const importDecl = result[0] as ts.ImportDeclaration;
    expect(ts.isImportDeclaration(importDecl)).toBe(true);
    expect((importDecl.moduleSpecifier as ts.StringLiteral).text).toBe(
      '@general-dexterity/cube-records'
    );

    // Check for module declaration
    const moduleDecl = result[1] as ts.ModuleDeclaration;
    expect(ts.isModuleDeclaration(moduleDecl)).toBe(true);
    expect((moduleDecl.name as ts.StringLiteral).text).toBe(
      '@general-dexterity/cube-records'
    );

    // Check for export declaration
    const exportDecl = result[2] as ts.ExportDeclaration;
    expect(ts.isExportDeclaration(exportDecl)).toBe(true);
  });

  it('generates correct CubeRecordMap interface', () => {
    const definitions = [mockCubeDefinition, mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;

    expect(cubeRecordMap.name?.escapedText).toBe('CubeRecordMap');
    expect(cubeRecordMap.members.length).toBe(2); // orders and ordersview

    // Check orders property
    const ordersProperty = cubeRecordMap.members[0] as ts.PropertySignature;
    expect(ordersProperty.name?.escapedText).toBe('orders');

    // Check ordersview property
    const ordersViewProperty = cubeRecordMap.members[1] as ts.PropertySignature;
    expect(ordersViewProperty.name?.escapedText).toBe('ordersview');
  });

  it('generates correct measures type', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;
    const ordersProperty = cubeRecordMap.members[0] as ts.PropertySignature;
    const ordersType = ordersProperty.type as ts.TypeLiteralNode;

    // Find measures property
    const measuresProperty = ordersType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) && m.name?.escapedText === 'measures'
    );

    expect(measuresProperty).toBeDefined();
    const measuresType = measuresProperty?.type as ts.TypeLiteralNode;
    expect(measuresType.members.length).toBe(1); // count property

    const countProperty = measuresType.members[0] as ts.PropertySignature;
    expect(countProperty.name?.escapedText).toBe('count');
  });

  it('generates correct dimensions type', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;
    const ordersProperty = cubeRecordMap.members[0] as ts.PropertySignature;
    const ordersType = ordersProperty.type as ts.TypeLiteralNode;

    // Find dimensions property
    const dimensionsProperty = ordersType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) && m.name?.escapedText === 'dimensions'
    );

    expect(dimensionsProperty).toBeDefined();
    const dimensionsType = dimensionsProperty?.type as ts.TypeLiteralNode;
    expect(dimensionsType.members.length).toBe(1); // status property

    const statusProperty = dimensionsType.members[0] as ts.PropertySignature;
    expect(statusProperty.name?.escapedText).toBe('status');
  });

  it('generates correct joins type', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;
    const ordersProperty = cubeRecordMap.members[0] as ts.PropertySignature;
    const ordersType = ordersProperty.type as ts.TypeLiteralNode;

    // Find joins property
    const joinsProperty = ordersType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) && m.name?.escapedText === 'joins'
    );

    expect(joinsProperty).toBeDefined();
    expect(joinsProperty?.questionToken).toBeDefined(); // Optional property

    const joinsType = joinsProperty?.type as ts.TupleTypeNode;
    expect(ts.isTupleTypeNode(joinsType)).toBe(true);
    expect(joinsType.elements.length).toBe(1); // ['users']

    const userLiteral = joinsType.elements[0] as ts.LiteralTypeNode;
    const userString = userLiteral.literal as ts.StringLiteral;
    expect(userString.text).toBe('users');
  });

  it('handles empty definitions array', () => {
    const definitions: CubeDefinitionWithRelations[] = [];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(3); // import + module declaration + export

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;

    expect(cubeRecordMap.members.length).toBe(0);
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

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;
    const emptyProperty = cubeRecordMap.members[0] as ts.PropertySignature;

    expect(emptyProperty.name?.escapedText).toBe('empty');

    const emptyType = emptyProperty.type as ts.TypeLiteralNode;
    const measuresProperty = emptyType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) && m.name?.escapedText === 'measures'
    );
    const dimensionsProperty = emptyType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) && m.name?.escapedText === 'dimensions'
    );

    const measuresType = measuresProperty?.type as ts.TypeLiteralNode;
    const dimensionsType = dimensionsProperty?.type as ts.TypeLiteralNode;

    expect(measuresType.members.length).toBe(0);
    expect(dimensionsType.members.length).toBe(0);
  });

  it('handles empty joins array correctly', () => {
    const definitions = [mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1] as ts.ModuleDeclaration;
    const moduleBlock = moduleDecl.body as ts.ModuleBlock;
    const cubeRecordMap = moduleBlock.statements[0] as ts.InterfaceDeclaration;
    const viewProperty = cubeRecordMap.members[0] as ts.PropertySignature;
    const viewType = viewProperty.type as ts.TypeLiteralNode;

    const joinsProperty = viewType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) && m.name?.escapedText === 'joins'
    );

    const joinsType = joinsProperty?.type as ts.TupleTypeNode;
    expect(ts.isTupleTypeNode(joinsType)).toBe(true);
    expect(joinsType.elements.length).toBe(0); // Empty tuple
  });
});

