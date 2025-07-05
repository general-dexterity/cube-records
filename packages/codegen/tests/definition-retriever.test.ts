import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CubeDefinition, EndpointResponse } from "../src/cube";
import { DefinitionRetriever } from "../src/definition-retriever";

describe("DefinitionRetriever", () => {
  const mockEndpoint = "https://api.example.com/cubes";
  let retriever: DefinitionRetriever;

  beforeEach(() => {
    retriever = new DefinitionRetriever(mockEndpoint);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retrieves and transforms cube definitions with relations", async () => {
    const mockCubes: CubeDefinition[] = [
      {
        name: "Orders",
        type: "cube",
        title: "Orders",
        isVisible: true,
        public: true,
        connectedComponent: 1,
        measures: [],
        dimensions: [],
        segments: [],
      },
      {
        name: "Users",
        type: "cube",
        title: "Users",
        isVisible: true,
        public: true,
        connectedComponent: 1,
        measures: [],
        dimensions: [],
        segments: [],
      },
      {
        name: "Products",
        type: "cube",
        title: "Products",
        isVisible: true,
        public: true,
        connectedComponent: 2,
        measures: [],
        dimensions: [],
        segments: [],
      },
    ];

    const mockResponse: EndpointResponse = { cubes: mockCubes };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse,
    } as Response);

    const result = await retriever.retrieveDefinitions();

    expect(fetch).toHaveBeenCalledWith(mockEndpoint);
    expect(result).toHaveLength(3);

    const ordersResult = result.find((c) => c.name === "Orders");
    expect(ordersResult?.joins).toEqual(["Users"]);

    const usersResult = result.find((c) => c.name === "Users");
    expect(usersResult?.joins).toEqual(["Orders"]);

    const productsResult = result.find((c) => c.name === "Products");
    expect(productsResult?.joins).toEqual([]);
  });

  it("handles empty cube list", async () => {
    const mockResponse: EndpointResponse = { cubes: [] };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse,
    } as Response);

    const result = await retriever.retrieveDefinitions();

    expect(result).toEqual([]);
  });

  it("handles cubes with no relations", async () => {
    const mockCubes: CubeDefinition[] = [
      {
        name: "Standalone",
        type: "cube",
        title: "Standalone Cube",
        isVisible: true,
        public: true,
        connectedComponent: 1,
        measures: [],
        dimensions: [],
        segments: [],
      },
    ];

    const mockResponse: EndpointResponse = { cubes: mockCubes };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse,
    } as Response);

    const result = await retriever.retrieveDefinitions();

    expect(result).toHaveLength(1);
    expect(result[0].joins).toEqual([]);
  });

  it("groups cubes by connected component correctly", async () => {
    const mockCubes: CubeDefinition[] = [
      {
        name: "A",
        type: "cube",
        title: "Cube A",
        isVisible: true,
        public: true,
        connectedComponent: 1,
        measures: [],
        dimensions: [],
        segments: [],
      },
      {
        name: "B",
        type: "cube",
        title: "Cube B",
        isVisible: true,
        public: true,
        connectedComponent: 1,
        measures: [],
        dimensions: [],
        segments: [],
      },
      {
        name: "C",
        type: "cube",
        title: "Cube C",
        isVisible: true,
        public: true,
        connectedComponent: 2,
        measures: [],
        dimensions: [],
        segments: [],
      },
      {
        name: "D",
        type: "cube",
        title: "Cube D",
        isVisible: true,
        public: true,
        connectedComponent: 2,
        measures: [],
        dimensions: [],
        segments: [],
      },
    ];

    const mockResponse: EndpointResponse = { cubes: mockCubes };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => mockResponse,
    } as Response);

    const result = await retriever.retrieveDefinitions();

    const cubeA = result.find((c) => c.name === "A");
    const cubeB = result.find((c) => c.name === "B");
    const cubeC = result.find((c) => c.name === "C");
    const cubeD = result.find((c) => c.name === "D");

    expect(cubeA?.joins).toEqual(["B"]);
    expect(cubeB?.joins).toEqual(["A"]);
    expect(cubeC?.joins).toEqual(["D"]);
    expect(cubeD?.joins).toEqual(["C"]);
  });

  it("handles fetch errors", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    await expect(retriever.retrieveDefinitions()).rejects.toThrow(
      "Network error",
    );
  });

  it("handles invalid JSON response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as Response);

    await expect(retriever.retrieveDefinitions()).rejects.toThrow(
      "Invalid JSON",
    );
  });
});
