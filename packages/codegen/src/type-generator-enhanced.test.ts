import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { TypeGenerator } from './type-generator';
import type { CubeDefinitionWithRelations } from './cube';

describe('TypeGenerator - Enhanced Features', () => {
  const generator = new TypeGenerator();

  it('generates __cubetype attribute for dimensions', () => {
    const definitions: CubeDefinitionWithRelations[] = [
      {
        name: 'Orders',
        type: 'cube',
        title: 'Orders',
        isVisible: true,
        public: true,
        measures: [
          {
            name: 'orders.count',
            title: 'Count',
            shortTitle: 'Count',
            cumulativeTotal: false,
            cumulative: false,
            type: 'number',
            aggType: 'count',
            drillMembersGrouped: { measures: [], dimensions: [] },
            isVisible: true,
            public: true,
          },
        ],
        dimensions: [
          {
            name: 'orders.id',
            title: 'Id',
            type: 'number',
            shortTitle: 'Id',
            suggestFilterValues: true,
            isVisible: true,
            public: true,
            primaryKey: true,
          },
          {
            name: 'orders.order_date',
            title: 'Order Date',
            type: 'time',
            shortTitle: 'Order Date',
            suggestFilterValues: false,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
          {
            name: 'orders.status',
            title: 'Status',
            type: 'string',
            shortTitle: 'Status',
            suggestFilterValues: true,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
        ],
        segments: [],
        joins: ['users'],
      },
    ];

    const statements = generator.generateTypes(definitions);
    const printer = ts.createPrinter();
    const sourceFile = ts.createSourceFile(
      'test.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );

    const code = statements
      .map((statement) => printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
      .join('\n');

    // Check that __cubetype is generated for dimensions
    expect(code).toContain('__cubetype');
    expect(code).toContain('"time"');
    expect(code).toContain('"string"');
    expect(code).toContain('"number"');

    // Verify structure
    expect(code).toContain('orders: {');
    expect(code).toContain('measures: {');
    expect(code).toContain('dimensions: {');
    expect(code).toContain('order_date: {');
  });

  it('generates __cubetype attribute for measures', () => {
    const definitions: CubeDefinitionWithRelations[] = [
      {
        name: 'Products',
        type: 'cube',
        title: 'Products',
        isVisible: true,
        public: true,
        measures: [
          {
            name: 'products.price',
            title: 'Price',
            shortTitle: 'Price',
            cumulativeTotal: false,
            cumulative: false,
            type: 'number',
            aggType: 'sum',
            drillMembersGrouped: { measures: [], dimensions: [] },
            isVisible: true,
            public: true,
          },
        ],
        dimensions: [
          {
            name: 'products.name',
            title: 'Name',
            type: 'string',
            shortTitle: 'Name',
            suggestFilterValues: true,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
        ],
        segments: [],
        joins: [],
      },
    ];

    const statements = generator.generateTypes(definitions);
    const printer = ts.createPrinter();
    const sourceFile = ts.createSourceFile(
      'test.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );

    const code = statements
      .map((statement) => printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
      .join('\n');

    // Check that __cubetype is generated for measures
    expect(code).toContain('price: {');
    expect(code).toContain('type: number');
    expect(code).toContain('__cubetype');
  });

  it('handles all dimension types correctly', () => {
    const definitions: CubeDefinitionWithRelations[] = [
      {
        name: 'TestCube',
        type: 'cube',
        title: 'Test Cube',
        isVisible: true,
        public: true,
        measures: [],
        dimensions: [
          {
            name: 'test_cube.time_field',
            title: 'Time Field',
            type: 'time',
            shortTitle: 'Time',
            suggestFilterValues: false,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
          {
            name: 'test_cube.string_field',
            title: 'String Field',
            type: 'string',
            shortTitle: 'String',
            suggestFilterValues: true,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
          {
            name: 'test_cube.number_field',
            title: 'Number Field',
            type: 'number',
            shortTitle: 'Number',
            suggestFilterValues: true,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
          {
            name: 'test_cube.boolean_field',
            title: 'Boolean Field',
            type: 'boolean',
            shortTitle: 'Boolean',
            suggestFilterValues: true,
            isVisible: true,
            public: true,
            primaryKey: false,
          },
        ],
        segments: [],
        joins: [],
      },
    ];

    const statements = generator.generateTypes(definitions);
    const printer = ts.createPrinter();
    const sourceFile = ts.createSourceFile(
      'test.ts',
      '',
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS
    );

    const code = statements
      .map((statement) => printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile))
      .join('\n');

    // Verify all types are handled
    expect(code).toContain('time_field: {');
    expect(code).toContain('type: string'); // time maps to string in TS
    expect(code).toContain('__cubetype: "time"');

    expect(code).toContain('string_field: {');
    expect(code).toContain('__cubetype: "string"');

    expect(code).toContain('number_field: {');
    expect(code).toContain('__cubetype: "number"');

    expect(code).toContain('boolean_field: {');
    expect(code).toContain('type: boolean');
    expect(code).toContain('__cubetype: "boolean"');
  });
});