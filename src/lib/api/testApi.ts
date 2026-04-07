import { customAxios } from "./customAxios";

export type DevHealthResponse = {
  status: string;
  [key: string]: unknown;
};

export type DevTestEntity = {
  id: string;
  [key: string]: unknown;
};

export type DevTestEntitiesResponse = {
  data: DevTestEntity[];
};

export const testApi = {
  async getHealth() {
    const response = await customAxios.get<DevHealthResponse>("dev/health");
    return response.data;
  },

  async getTestEntities() {
    const response = await customAxios.get<DevTestEntitiesResponse>("dev/test-entities");
    return response.data;
  },
};
