import { apiRequest } from "./httpClient";

export type DeanOfficeContactPayload = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

type DeanOfficeContactResponse = {
  success?: boolean;
  message?: string;
};

export const sendDeanOfficeMessage = async (payload: DeanOfficeContactPayload) => {
  return apiRequest<DeanOfficeContactResponse>("/contact/dean-office", {
    method: "POST",
    body: payload,
  });
};
