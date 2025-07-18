import ts from 'typescript';
import { assert, describe, expect, it } from 'vitest';
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
    const importDecl = result[0];

    assert(ts.isImportDeclaration(importDecl));
    assert(ts.isStringLiteral(importDecl.moduleSpecifier));

    expect(importDecl.moduleSpecifier.text).toBe(
      '@general-dexterity/cube-records'
    );

    // Check for module declaration
    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(ts.isStringLiteral(moduleDecl.name));
    expect(moduleDecl.name.text).toBe('@general-dexterity/cube-records');

    // Check for export declaration
    const exportDecl = result[2];
    assert(ts.isExportDeclaration(exportDecl));
  });

  it('generates correct CubeRecordMap interface', () => {
    const definitions = [mockCubeDefinition, mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));

    const cubeRecordMap = moduleBlock.statements[0];
    expect(cubeRecordMap.name?.escapedText).toBe('CubeRecordMap');
    expect(cubeRecordMap.members.length).toBe(2); // orders and ordersview

    // Check orders property
    const ordersProperty = cubeRecordMap.members[0];
    assert(ts.isPropertySignature(ordersProperty));
    assert(ordersProperty.name);
    assert(ts.isIdentifier(ordersProperty.name));
    expect(ordersProperty.name.escapedText).toBe('orders');

    // Check ordersview property
    const ordersViewProperty = cubeRecordMap.members[1];
    assert(ts.isPropertySignature(ordersViewProperty));
    assert(ordersViewProperty.name);
    assert(ts.isIdentifier(ordersViewProperty.name));
    expect(ordersViewProperty.name.escapedText).toBe('ordersview');
  });

  it('generates correct measures type', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));

    const cubeRecordMap = moduleBlock.statements[0];
    const ordersProperty = cubeRecordMap.members[0];
    assert(ts.isPropertySignature(ordersProperty));
    assert(ordersProperty.type);
    assert(ts.isTypeLiteralNode(ordersProperty.type));

    const ordersType = ordersProperty.type;

    // Find measures property
    const measuresProperty = ordersType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) &&
        ts.isIdentifier(m.name) &&
        m.name?.escapedText === 'measures'
    );

    expect(measuresProperty).toBeDefined();
    assert(measuresProperty?.type);
    assert(ts.isTypeLiteralNode(measuresProperty.type));

    const measuresType = measuresProperty.type;
    expect(measuresType.members.length).toBe(1); // count property

    const countProperty = measuresType.members[0];
    assert(ts.isPropertySignature(countProperty));
    assert(ts.isIdentifier(countProperty.name));
    expect(countProperty.name.escapedText).toBe('count');
  });

  it('generates correct dimensions type', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));

    const cubeRecordMap = moduleBlock.statements[0];
    const ordersProperty = cubeRecordMap.members[0];
    assert(ts.isPropertySignature(ordersProperty));
    assert(ordersProperty.type);
    assert(ts.isTypeLiteralNode(ordersProperty.type));

    const ordersType = ordersProperty.type;

    // Find dimensions property
    const dimensionsProperty = ordersType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) &&
        ts.isIdentifier(m.name) &&
        m.name?.escapedText === 'dimensions'
    );

    expect(dimensionsProperty).toBeDefined();
    assert(dimensionsProperty?.type);
    assert(ts.isTypeLiteralNode(dimensionsProperty.type));

    const dimensionsType = dimensionsProperty.type;
    expect(dimensionsType.members.length).toBe(1); // status property

    const statusProperty = dimensionsType.members[0];
    assert(ts.isPropertySignature(statusProperty));
    assert(ts.isIdentifier(statusProperty.name));
    expect(statusProperty.name?.escapedText).toBe('status');
  });

  it('generates correct joins type', () => {
    const definitions = [mockCubeDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));

    const cubeRecordMap = moduleBlock.statements[0];
    const ordersProperty = cubeRecordMap.members[0];
    assert(ts.isPropertySignature(ordersProperty));
    assert(ordersProperty.type);
    assert(ts.isTypeLiteralNode(ordersProperty.type));

    const ordersType = ordersProperty.type;

    // Find joins property
    const joinsProperty = ordersType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) &&
        ts.isIdentifier(m.name) &&
        m.name.escapedText === 'joins'
    );

    expect(joinsProperty).toBeDefined();
    assert(joinsProperty);
    expect(joinsProperty.questionToken).toBeDefined(); // Optional property

    assert(joinsProperty.type);
    assert(ts.isTupleTypeNode(joinsProperty.type));

    const joinsType = joinsProperty.type;
    expect(joinsType.elements.length).toBe(1); // ['users']

    const userLiteral = joinsType.elements[0];
    assert(ts.isLiteralTypeNode(userLiteral));
    assert(ts.isStringLiteral(userLiteral.literal));

    const userString = userLiteral.literal;
    expect(userString.text).toBe('users');
  });

  it('handles empty definitions array', () => {
    const definitions: CubeDefinitionWithRelations[] = [];
    const result = typeGenerator.generateTypes(definitions);

    expect(result).toHaveLength(3); // import + module declaration + export

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));
    const cubeRecordMap = moduleBlock.statements[0];

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

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));
    const cubeRecordMap = moduleBlock.statements[0];
    const emptyProperty = cubeRecordMap.members[0];
    assert(ts.isPropertySignature(emptyProperty));

    assert(ts.isIdentifier(emptyProperty.name));
    expect(emptyProperty.name?.escapedText).toBe('empty');

    assert(emptyProperty.type);
    assert(ts.isTypeLiteralNode(emptyProperty.type));

    const emptyType = emptyProperty.type;
    const measuresProperty = emptyType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) &&
        ts.isIdentifier(m.name) &&
        m.name?.escapedText === 'measures'
    );
    const dimensionsProperty = emptyType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) &&
        ts.isIdentifier(m.name) &&
        m.name?.escapedText === 'dimensions'
    );

    assert(measuresProperty?.type);
    assert(ts.isTypeLiteralNode(measuresProperty.type));

    const measuresType = measuresProperty.type;
    assert(dimensionsProperty?.type);
    assert(ts.isTypeLiteralNode(dimensionsProperty.type));

    const dimensionsType = dimensionsProperty.type;
    expect(measuresType.members.length).toBe(0);
    expect(dimensionsType.members.length).toBe(0);
  });

  it('handles empty joins array correctly', () => {
    const definitions = [mockViewDefinition];
    const result = typeGenerator.generateTypes(definitions);

    const moduleDecl = result[1];
    assert(ts.isModuleDeclaration(moduleDecl));
    assert(moduleDecl.body);
    assert(ts.isModuleBlock(moduleDecl.body));

    const moduleBlock = moduleDecl.body;
    assert(ts.isInterfaceDeclaration(moduleBlock.statements[0]));

    const cubeRecordMap = moduleBlock.statements[0];
    const viewProperty = cubeRecordMap.members[0];
    assert(ts.isPropertySignature(viewProperty));
    assert(viewProperty.type);
    assert(ts.isTypeLiteralNode(viewProperty.type));

    const viewType = viewProperty.type;

    const joinsProperty = viewType.members.find(
      (m): m is ts.PropertySignature =>
        ts.isPropertySignature(m) &&
        ts.isIdentifier(m.name) &&
        m.name?.escapedText === 'joins'
    );

    assert(joinsProperty?.type);
    assert(ts.isTupleTypeNode(joinsProperty.type));
    const joinsType = joinsProperty.type;
    expect(joinsType.elements.length).toBe(0); // Empty tuple
  });
});
