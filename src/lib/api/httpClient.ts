type ApiPrimitive = string | number | boolean | null;
type ApiValue = ApiPrimitive | ApiValue[] | { [key: string]: ApiValue };

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: ApiValue | FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const legacyBackendUrl = import.meta.env.VITE_BACKEND_URL?.trim();
const productionApiUrl = "https://asystentstudencki.onrender.com/api";

const normalizeApiBaseUrl = (value?: string) => {
  if (!value) {
    return "";
  }

  const trimmed = value.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

export const API_URL = normalizeApiBaseUrl(
  rawApiUrl || legacyBackendUrl || (import.meta.env.PROD ? productionApiUrl : ""),
);

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

const buildUrl = (path: string) => {
  if (!API_URL) {
    throw new Error("Brak konfiguracji API. Ustaw VITE_API_URL.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL.replace(/\/$/, "")}${normalizedPath}`;
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.startsWith("text/")) {
    return response.text();
  }

  return null;
};

const getFirstText = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = getFirstText(item);

      if (text) {
        return text;
      }
    }
  }

  return undefined;
};

const getFirstFieldError = (value: unknown, preferredField?: string): string | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const fieldErrors = value as Record<string, unknown>;

  if (preferredField) {
    const preferredError = getFirstText(fieldErrors[preferredField]);

    if (preferredError) {
      return preferredError;
    }
  }

  for (const fieldValue of Object.values(fieldErrors)) {
    const text = getFirstText(fieldValue);

    if (text) {
      return text;
    }
  }

  return undefined;
};

export const getApiErrorMessage = (status: number, data: unknown, preferredField?: string) => {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const errors = record.errors && typeof record.errors === "object"
      ? (record.errors as Record<string, unknown>)
      : undefined;
    const fieldError =
      getFirstFieldError(errors?.fieldErrors, preferredField) ||
      getFirstFieldError(record.fieldErrors, preferredField);

    if (fieldError) {
      return fieldError;
    }

    const formError = getFirstText(errors?.formErrors);

    if (formError) {
      return formError;
    }

    const message = record.message ?? record.error ?? record.detail;
    const textMessage = getFirstText(message);

    if (textMessage) {
      return textMessage;
    }

    if (
      message &&
      typeof message === "object" &&
      "message" in message &&
      typeof message.message === "string"
    ) {
      return message.message;
    }
  }

  return `Request failed with status ${status}.`;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, signal } = options;
  const requestHeaders = new Headers(headers);

  const init: RequestInit = {
    method,
    credentials: "include",
    headers: requestHeaders,
    signal,
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      requestHeaders.set("Content-Type", "application/json");
      init.body = JSON.stringify(body);
    }
  }

  const response = await fetch(buildUrl(path), init);
  const data = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    throw new ApiError(getApiErrorMessage(response.status, data), response.status, data);
  }

  return data as T;
}
