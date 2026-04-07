import { ApiError, apiRequest } from "../api";
import type { FeeType } from "../payments";

type CheckoutSessionPayload = {
  orderId: string;
  feeType: FeeType;
};

type CheckoutSessionResponse = {
  sessionId?: string;
  url?: string;
  publishableKey?: string;
  amount?: number;
  currency?: string;
  data?: CheckoutSessionResponse;
};

type PaymentStatusResponse = {
  orderId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;
  payment?: {
    status?: string;
    amount?: number;
    currency?: string;
  };
  data?: PaymentStatusResponse;
};

export type PaymentStatus = "paid" | "pending" | "cancelled" | "failed" | "unknown";

export type PaymentStatusResult = {
  orderId: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
};

const unwrapCheckoutSession = (
  payload: CheckoutSessionResponse,
): Required<Pick<CheckoutSessionResponse, "url">> & CheckoutSessionResponse => {
  const source = payload.data ?? payload;

  if (!source.url || typeof source.url !== "string") {
    throw new Error("Backend nie zwrocil adresu przekierowania Stripe Checkout.");
  }

  return {
    ...source,
    url: source.url,
  };
};

const normalizePaymentStatus = (value: unknown): PaymentStatus => {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "paid" || normalized === "succeeded" || normalized === "complete") {
    return "paid";
  }

  if (normalized === "pending" || normalized === "processing" || normalized === "open") {
    return "pending";
  }

  if (normalized === "cancelled" || normalized === "canceled" || normalized === "expired") {
    return "cancelled";
  }

  if (normalized === "failed" || normalized === "unpaid") {
    return "failed";
  }

  return "unknown";
};

export const createCheckoutSession = async (payload: CheckoutSessionPayload) => {
  const response = await apiRequest<CheckoutSessionResponse>("/payments/checkout-session", {
    method: "POST",
    body: payload,
  });

  return unwrapCheckoutSession(response);
};

export const getPaymentStatus = async (orderId: string): Promise<PaymentStatusResult> => {
  const response = await apiRequest<PaymentStatusResponse>(`/payments/${encodeURIComponent(orderId)}/status`);
  const source = response.data ?? response;
  const rawStatus = source.status ?? source.paymentStatus ?? source.payment?.status;

  return {
    orderId: source.orderId ?? orderId,
    status: normalizePaymentStatus(rawStatus),
    amount: source.amount ?? source.payment?.amount,
    currency: source.currency ?? source.payment?.currency,
  };
};

export const getPaymentErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Sesja wygasla. Zaloguj sie ponownie, aby kontynuowac platnosc.";
    }

    if (error.status === 403) {
      return "Nie masz uprawnien do wykonania tej operacji.";
    }

    if (error.status === 409) {
      return "Platnosc dla tego zamowienia zostala juz utworzona lub oplacona.";
    }

    if (error.status === 422 || error.status === 400) {
      return error.message || "Niepoprawne dane platnosci.";
    }

    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nie udalo sie przetworzyc platnosci.";
};
