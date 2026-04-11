import { ApiError, apiRequest } from "./httpClient";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestConfig = {
  data?: unknown;
};

const request = async <T>(method: RequestMethod, path: string, config?: RequestConfig) => {
  const data = await apiRequest<T>(path, {
    method,
    body: config?.data as never,
  });

  return { data };
};

export const customAxios = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, data?: unknown) => request<T>("POST", path, { data }),
  put: <T>(path: string, data?: unknown) => request<T>("PUT", path, { data }),
  patch: <T>(path: string, data?: unknown) => request<T>("PATCH", path, { data }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export const axiosErrorHandler = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      isError: true as const,
      key: "errors.internal_server_error",
      message: error.message,
      code: error.status,
    };
  }

  return {
    isError: true as const,
    key: "errors.internal_server_error",
    message: error instanceof Error ? error.message : "Nieznany blad serwera.",
    code: undefined,
  };
};
