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
    const declarations: ts.Declaration[] = [];
    declarations.push(...this.generateSharedTypes());

    const modelDeclarations = Object.fromEntries(
      definitions.map((definition) => [
        definition.name,
        this.buildInterface(definition),
      ])
    );

    declarations.push(...Object.values(modelDeclarations));
    declarations.push(...this.createUnionTypes(modelDeclarations));

    return declarations;
  }

  private createUnionTypes(declarations: {
    [name: string]: ts.InterfaceDeclaration;
  }): ts.Declaration[] {
    // Create model name map
    const cubeModelNameMap = ts.factory.createInterfaceDeclaration(
      undefined,
      ts.factory.createIdentifier('CubeModelNameMap'),
      [],
      undefined,
      Object.keys(declarations).map((name) =>
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier(name),
          undefined,
          ts.factory.createTypeReferenceNode(
            declarations[name].name.escapedText.toString()
          )
        )
      )
    );

    // Group declarations by type (cube or view)
    const modelInterfaces: ts.TypeReferenceNode[] = [];
    const viewInterfaces: ts.TypeReferenceNode[] = [];

    for (const declaration of Object.values(declarations)) {
      const name = declaration.name.escapedText.toString();
      const typeRef = ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(name),
        undefined
      );

      if (name.endsWith(ModelInterfaceNameSuffix)) {
        modelInterfaces.push(typeRef);
      } else if (name.endsWith(ViewInterfaceNameSuffix)) {
        viewInterfaces.push(typeRef);
      }
    }

    // Create CubeModel union type (only models)
    const cubeModelType =
      modelInterfaces.length > 0
        ? ts.factory.createTypeAliasDeclaration(
            undefined,
            ts.factory.createIdentifier('CubeModel'),
            undefined,
            ts.factory.createUnionTypeNode(modelInterfaces)
          )
        : null;

    // Create CubeView union type (only views)
    const cubeViewType =
      viewInterfaces.length > 0
        ? ts.factory.createTypeAliasDeclaration(
            undefined,
            ts.factory.createIdentifier('CubeView'),
            undefined,
            ts.factory.createUnionTypeNode(viewInterfaces)
          )
        : null;

    // Create CubeResource union type (all resources - both models and views)
    const cubeResourceType =
      (cubeModelType || cubeViewType) &&
      ts.factory.createTypeAliasDeclaration(
        undefined,
        ts.factory.createIdentifier('CubeResource'),
        undefined,
        ts.factory.createUnionTypeNode(
          [
            cubeModelType &&
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier('CubeModel'),
                undefined
              ),
            cubeViewType &&
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier('CubeView'),
                undefined
              ),
          ].filter((v) => v !== null)
        )
      );

    return [
      cubeModelNameMap,
      cubeModelType,
      cubeViewType,
      cubeResourceType,
    ].filter((v) => v !== null);
  }

  // Generate the `CubeDimension`, `CubeMeasure` and `CubeModel` interfaces.
  private generateSharedTypes() {
    const typeParameter = ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier('T'),
      ts.factory.createUnionTypeNode([
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
      ])
    );

    return ['CubeDimension', 'CubeMeasure'].map((identifier) =>
      ts.factory.createInterfaceDeclaration(
        undefined,
        ts.factory.createIdentifier(identifier),
        [typeParameter],
        undefined,
        [
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('name'),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
          ),
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('type'),
            undefined,
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier('T'),
              undefined
            )
          ),
          // Add description field to the interface
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('description'),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken), // Make it optional
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
          ),
        ]
      )
    );
  }

  private buildInterface(definition: CubeDefinitionWithRelations) {
    const interfaceName = `${cubeTitleToTsInterfaceName(definition.title)}${
      definition.type === 'cube'
        ? ModelInterfaceNameSuffix
        : ViewInterfaceNameSuffix
    }`;

    // Create the interface with JSDoc

    const interfaceDeclaration = ts.factory.createInterfaceDeclaration(
      [],
      ts.factory.createIdentifier(interfaceName),
      [],
      undefined,
      [
        ts.factory.createPropertySignature(
          undefined,
          'name',
          undefined,
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral(definition.name)
          )
        ),
        ts.factory.createPropertySignature(
          undefined,
          'measures',
          undefined,
          ts.factory.createTypeLiteralNode(
            definition.measures.map((measure) => {
              const property = ts.factory.createPropertySignature(
                [],
                ts.factory.createIdentifier(
                  cubeMeasureToPropertyName(measure.name)
                ),
                undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('CubeMeasure'),
                  [
                    ts.factory.createKeywordTypeNode(
                      dimensionTypeToTsType(measure.type)
                    ),
                  ]
                )
              );

              return property;
            })
          )
        ),
        ts.factory.createPropertySignature(
          undefined,
          'dimensions',
          undefined,
          ts.factory.createTypeLiteralNode(
            definition.dimensions.map((dimension) => {
              return ts.factory.createPropertySignature(
                undefined,
                ts.factory.createIdentifier(
                  cubeMeasureToPropertyName(dimension.name)
                ),
                undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('CubeDimension'),
                  [
                    ts.factory.createKeywordTypeNode(
                      dimensionTypeToTsType(dimension.type)
                    ),
                  ]
                )
              );
            })
          )
        ),

        ts.factory.createPropertySignature(
          undefined,
          'joins',
          undefined,
          ts.factory.createTupleTypeNode(
            definition.joins.map((join) =>
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(join)
              )
            )
          )
        ),

        ts.factory.createPropertySignature(
          undefined,
          'segments',
          undefined,
          ts.factory.createArrayTypeNode(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
          )
        ),
      ]
    );

    return interfaceDeclaration;
  }
}
