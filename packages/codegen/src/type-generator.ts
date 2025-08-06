import ts from 'typescript';
import type {
  CubeDefinitionWithRelations,
  DimensionDefinition,
  MeasureDefinition,
} from './cube';
import { cubeMeasureToPropertyName, dimensionTypeToTsType } from './utils';

export class TypeGenerator {
  generateTypes(definitions: CubeDefinitionWithRelations[]): ts.Statement[] {
    // Only generate the module augmentation for CubeRecordMap
    return this.createModuleAugmentation(definitions);
  }

  private createModuleAugmentation(
    definitions: CubeDefinitionWithRelations[]
  ): ts.Statement[] {
    // Create the CubeRecordMap interface (without export modifier)
    const cubeRecordMap = ts.factory.createInterfaceDeclaration(
      undefined, // No modifiers
      ts.factory.createIdentifier('CubeRecordMap'),
      [],
      undefined,
      definitions.map((definition) => {
        const cubeNameLowercase = definition.name.toLowerCase();

        return ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(cubeNameLowercase),
          undefined,
          ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('measures'),
              undefined,
              this.createMeasuresType(definition.measures)
            ),
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('dimensions'),
              undefined,
              this.createDimensionsType(definition.dimensions)
            ),
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('joins'),
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              this.createJoinsType(definition.joins)
            ),
          ])
        );
      })
    );

    // Create an import statement
    const importDeclaration = ts.factory.createImportDeclaration(
      undefined,
      undefined,
      ts.factory.createStringLiteral('@general-dexterity/cube-records'),
      undefined
    );

    // Create an empty export statement
    const emptyExport = ts.factory.createExportDeclaration(
      undefined,
      false,
      ts.factory.createNamedExports([]),
      undefined,
      undefined
    );

    // Create module augmentation with empty export first
    const moduleAugmentation = ts.factory.createModuleDeclaration(
      [ts.factory.createToken(ts.SyntaxKind.DeclareKeyword)],
      ts.factory.createStringLiteral('@general-dexterity/cube-records'),
      ts.factory.createModuleBlock([cubeRecordMap]),
      ts.NodeFlags.None
    );

    return [importDeclaration, moduleAugmentation, emptyExport];
  }

  // Helper method to create measures type from cube definition
  private createMeasuresType(measures: MeasureDefinition[]): ts.TypeNode {
    return ts.factory.createTypeLiteralNode(
      measures.map((measure) => {
        const propertyName = cubeMeasureToPropertyName(measure.name);

        const properties: ts.PropertySignature[] = [
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('type'),
            undefined,
            ts.factory.createKeywordTypeNode(
              dimensionTypeToTsType(measure.type)
            )
          ),
        ];

        // Add __cubetype for tracking original cube type
        if (measure.type) {
          properties.push(
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('__cubetype'),
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(measure.type)
              )
            )
          );
        }

        return ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(propertyName),
          undefined,
          ts.factory.createTypeLiteralNode(properties)
        );
      })
    );
  }

  // Helper method to create dimensions type from cube definition
  private createDimensionsType(dimensions: DimensionDefinition[]): ts.TypeNode {
    return ts.factory.createTypeLiteralNode(
      dimensions.map((dimension) => {
        const propertyName = cubeMeasureToPropertyName(dimension.name);

        const properties: ts.PropertySignature[] = [
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('type'),
            undefined,
            ts.factory.createKeywordTypeNode(
              dimensionTypeToTsType(dimension.type)
            )
          ),
        ];

        // Add __cubetype for tracking original cube type (especially important for 'time' dimensions)
        if (dimension.type) {
          properties.push(
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('__cubetype'),
              undefined, // Not optional for dimensions, as we need it for time filtering
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(dimension.type)
              )
            )
          );
        }

        return ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(propertyName),
          undefined,
          ts.factory.createTypeLiteralNode(properties)
        );
      })
    );
  }

  // Helper method to create joins type from cube definition
  private createJoinsType(joins: string[]): ts.TypeNode {
    // For empty joins, create an empty readonly tuple
    if (!joins || joins.length === 0) {
      return ts.factory.createTupleTypeNode([]);
    }

    return ts.factory.createTupleTypeNode(
      joins.map((join) =>
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral(join.toLowerCase())
        )
      )
    );
  }
}
