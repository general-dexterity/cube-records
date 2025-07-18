import "@general-dexterity/cube-records";

declare module "@general-dexterity/cube-records" {
  interface CubeRecordMap {
    users: {
      measures: {
        count: { type: number };
        totalRevenue: { type: number };
      };
      dimensions: {
        id: { type: string };
        name: { type: string };
        email: { type: string };
        createdAt: { type: string };
      };
      joins: readonly ['orders'];
    };
    orders: {
      measures: {
        count: { type: number };
        totalAmount: { type: number };
      };
      dimensions: {
        id: { type: string };
        status: { type: string };
        createdAt: { type: string };
      };
      joins: readonly ['users'];
    };
  }
}

export {};