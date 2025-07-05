import type { CubeDefinition, EndpointResponse } from "./cube";

export class DefinitionRetriever {
  constructor(private readonly endpoint: string) {}

  async retrieveDefinitions(): Promise<
    (CubeDefinition & {
      joins: string[];
    })[]
  > {
    const response = await fetch(this.endpoint);
    const data = (await response.json()) as EndpointResponse;
    const cubes = data.cubes;

    const byRelation = this.groupByRelation(cubes);
    const cubesWithRelations = cubes.map((cube) => {
      const relations = byRelation[cube.connectedComponent.toString()] ?? [];

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
        const key = def.connectedComponent.toString();
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(def);
        return acc;
      },
      {} as { [key: string]: CubeDefinition[] },
    );
  }
}
