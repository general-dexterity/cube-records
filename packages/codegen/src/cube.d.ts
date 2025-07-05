type CubeType = "cube" | "view";

export interface EndpointResponse {
  readonly cubes: CubeDefinition[];
}

interface CubeDefinition {
  readonly name: string;
  readonly type: CubeType;
  readonly title: string;
  readonly isVisible: boolean;
  readonly public: boolean;
  readonly description?: string;
  readonly connectedComponent: number;
  readonly measures: MeasureDefinition[];
  readonly dimensions: DimensionDefinition[];
  readonly segments: SegmentDefinition[];
}

export interface CubeDefinitionWithRelations extends CubeDefinition {
  readonly joins: string[];
}

interface DimensionDefinition {
  readonly name: string;
  readonly title: string;
  readonly type: DimensionType;
  readonly shortTitle: string;
  readonly suggestFilterValues: boolean;
  readonly isVisible: boolean;
  readonly public: boolean;
  readonly primaryKey: boolean;
  readonly description?: string;
}

type DimensionType = "number" | "string" | "time" | "boolean";

interface MeasureDefinition {
  readonly name: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly cumulativeTotal: boolean;
  readonly cumulative: boolean;
  readonly type: DimensionType;
  readonly aggType: AggType;
  readonly drillMembersGrouped: MeasureDrillMembersGrouped;
  readonly isVisible: boolean;
  readonly public: boolean;
  readonly description?: string;
}

type AggType = "sum" | "avg" | "count" | "countDistinct";

interface MeasureDrillMembersGrouped {
  readonly measures: string[];
  readonly dimensions: string[];
}

interface SegmentDefinition {
  readonly name: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly isVisible: boolean;
  readonly public: boolean;
}
