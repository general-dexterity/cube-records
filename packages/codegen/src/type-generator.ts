import ts from 'typescript';
import { ModelInterfaceNameSuffix, ViewInterfaceNameSuffix } from './constants';
import type { CubeDefinitionWithRelations } from './cube';
import {
  cubeMeasureToPropertyName,
  cubeTitleToTsInterfaceName,
  dimensionTypeToTsType,
} from './utils';

export class TypeGenerator {
  generateTypes(definitions: CubeDefinitionWithRelations[]): ts.Declaration[] {
    // Only generate the module augmentation for CubeRecordMap
    return this.createModuleAugmentation(definitions);
  }

  private createModuleAugmentation(
    definitions: CubeDefinitionWithRelations[]
  ): ts.Declaration[] {
    // Create the CubeRecordMap interface with inline structure
    const cubeRecordMap = ts.factory.createInterfaceDeclaration(
      undefined,
      ts.factory.createIdentifier('CubeRecordMap'),
      [],
      undefined,
      definitions.map((definition) => {
        const cubeNameLowercase = definition.name.toLowerCase();

        // Create simplified inline structure
        return ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(cubeNameLowercase),
          undefined,
          ts.factory.createTypeLiteralNode([
            // Measures property with simplified structure
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('measures'),
              undefined,
              this.createMeasuresType(definition.measures)
            ),
            // Dimensions property with simplified structure
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('dimensions'),
              undefined,
              this.createDimensionsType(definition.dimensions)
            ),
            // Joins property as readonly array
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

    // Wrap CubeRecordMap in a module augmentation for the records package
    const moduleAugmentation = ts.factory.createModuleDeclaration(
      [ts.factory.createToken(ts.SyntaxKind.DeclareKeyword)],
      ts.factory.createStringLiteral('@general-dexterity/cube-records'),
      ts.factory.createModuleBlock([cubeRecordMap]),
      ts.NodeFlags.None
    );

    return [moduleAugmentation];
  }

  // Helper method to create measures type from cube definition
  private createMeasuresType(measures: any[]): ts.TypeNode {
    return ts.factory.createTypeLiteralNode(
      measures.map((measure) => {
        const propertyName = cubeMeasureToPropertyName(measure.name);

        return ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(propertyName),
          undefined,
          ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('type'),
              undefined,
              ts.factory.createKeywordTypeNode(
                dimensionTypeToTsType(measure.type)
              )
            ),
          ])
        );
      })
    );
  }

  // Helper method to create dimensions type from cube definition
  private createDimensionsType(dimensions: any[]): ts.TypeNode {
    return ts.factory.createTypeLiteralNode(
      dimensions.map((dimension) => {
        const propertyName = cubeMeasureToPropertyName(dimension.name);

        return ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(propertyName),
          undefined,
          ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier('type'),
              undefined,
              ts.factory.createKeywordTypeNode(
                dimensionTypeToTsType(dimension.type)
              )
            ),
          ])
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
