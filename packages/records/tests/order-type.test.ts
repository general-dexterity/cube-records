import { describe, expectTypeOf, it } from "vitest";
import type {
  CubeRecordOrder,
  CubeRecordQueryParams,
} from "../src/use-cube-record-query";

// Mock CubeRecordMap for testing
declare module "../src/types" {
  interface CubeRecordMap {
    orderTestCube: {
      measures: {
        count: { type: number; __cubetype?: "number" };
        total: { type: number; __cubetype?: "number" };
        average: { type: number; __cubetype?: "number" };
      };
      dimensions: {
        id: { type: number; __cubetype: "number" };
        name: { type: string; __cubetype: "string" };
        created_at: { type: string; __cubetype: "time" };
        status: { type: string; __cubetype: "string" };
      };
      joins?: ["relatedCube"];
    };
    relatedCube: {
      measures: {
        amount: { type: number; __cubetype?: "number" };
      };
      dimensions: {
        id: { type: number; __cubetype: "number" };
        category: { type: string; __cubetype: "string" };
      };
      joins?: [];
    };
  }
}

describe("Order Type", () => {
  it("accepts valid measures and dimensions from the cube", () => {
    type OrderType = CubeRecordOrder<"orderTestCube">;

    // These should all be valid
    const validOrder: OrderType = {
      count: "asc",
      created_at: "asc",
      id: "asc",
      name: "desc",
      status: "desc",
      total: "desc",
    };

    expectTypeOf(validOrder).toMatchTypeOf<OrderType>();
  });

  it("accepts joined measures and dimensions", () => {
    type OrderType = CubeRecordOrder<"orderTestCube">;

    const orderWithJoins: OrderType = {
      count: "asc",
      "relatedCube.amount": "desc",
      "relatedCube.category": "asc",
      "relatedCube.id": "desc",
    };

    expectTypeOf(orderWithJoins).toMatchTypeOf<OrderType>();
  });

  it("only accepts asc or desc as values", () => {
    type OrderType = CubeRecordOrder<"orderTestCube">;

    // @ts-expect-error - invalid sort direction
    const _invalidOrder: OrderType = {
      count: "invalid",
    };

    // Valid directions
    const validOrder: OrderType = {
      count: "asc",
      total: "desc",
    };

    expectTypeOf(validOrder).toMatchTypeOf<OrderType>();
  });

  it("works with CubeRecordQueryParams", () => {
    type QueryParams = CubeRecordQueryParams<"orderTestCube">;

    const query: QueryParams = {
      dimensions: ["name", "status"],
      limit: 10,
      measures: ["count", "total"],
      order: {
        count: "desc",
        name: "asc",
        "relatedCube.amount": "desc",
      },
    };

    expectTypeOf(query).toMatchTypeOf<QueryParams>();
  });

  it("prevents ordering by non-existent fields", () => {
    type OrderType = CubeRecordOrder<"orderTestCube">;

    const _order: OrderType = {
      // Valid field
      count: "desc",
      // @ts-expect-error - non_existent_field doesn't exist
      non_existent_field: "asc",
    };

    // The valid part should still work
    const validPart: OrderType = {
      count: "desc",
    };
    expectTypeOf(validPart).toMatchTypeOf<OrderType>();
  });

  it("is optional in query params", () => {
    type QueryParams = CubeRecordQueryParams<"orderTestCube">;

    // Query without order is valid
    const queryWithoutOrder: QueryParams = {
      dimensions: ["name"],
      measures: ["count"],
    };

    // Query with order is valid
    const queryWithOrder: QueryParams = {
      dimensions: ["name"],
      measures: ["count"],
      order: {
        count: "desc",
      },
    };

    expectTypeOf(queryWithoutOrder).toMatchTypeOf<QueryParams>();
    expectTypeOf(queryWithOrder).toMatchTypeOf<QueryParams>();
  });
});
