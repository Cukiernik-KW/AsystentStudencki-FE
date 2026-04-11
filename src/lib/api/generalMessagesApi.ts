import { customAxios } from "./customAxios";

export type GeneralMessageItem = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type GeneralMessagesResponse = {
  data: GeneralMessageItem[];
};

export const generalMessagesApi = {
  async getGeneralMessages() {
    const response = await customAxios.get<GeneralMessagesResponse>("fulfillment-texts");
    return response.data;
  },
};
