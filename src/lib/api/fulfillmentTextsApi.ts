import { customAxios } from "./customAxios";

export type FulfillmentTextItem = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type FulfillmentTextsResponse = {
  data: FulfillmentTextItem[];
};

export const fulfillmentTextsApi = {
  async getFulfillmentTexts() {
    const response = await customAxios.get<FulfillmentTextsResponse>("fulfillment-texts");
    return response.data;
  },
};
