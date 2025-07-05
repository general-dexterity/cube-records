import type { CubeDefinition, EndpointResponse } from './cube';
import { isNil } from './utils';

export class DefinitionRetriever {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async retrieveDefinitions(): Promise<
    (CubeDefinition & {
      joins: string[];
    })[]
  > {
    const url = this.baseUrl.endsWith('/')
      ? `${this.baseUrl}v1/meta`
      : `${this.baseUrl}/v1/meta`;
    const response = await fetch(url);
    const data = (await response.json()) as EndpointResponse;
    const cubes = data.cubes;

    const byRelation = this.groupByRelation(cubes);
    const cubesWithRelations = cubes.map((cube) => {
      const relationKey = cube.connectedComponent?.toString() ?? '';
      const relations = byRelation[relationKey] ?? [];

      return {
        ...cube,
        joins: relations.map((c) => c.name).filter((c) => c !== cube.name),
      };
    });

    return cubesWithRelations;
  }

  private groupByRelation(defs: CubeDefinition[]): {
    [key: string]: CubeDefinition[];
  } {
    return defs.reduce(
      (acc, def) => {
        if (isNil(def.connectedComponent)) {
          return acc;
        }

        const key = def.connectedComponent.toString();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(def);
        return acc;
      },
      {} as { [key: string]: CubeDefinition[] }
    );
  }
}
