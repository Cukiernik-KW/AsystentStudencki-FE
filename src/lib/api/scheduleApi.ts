import { ApiError, apiRequest } from "./httpClient";

export type ScheduleEntry = {
  id: string;
  userId: string;
  dayOfWeek: number;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  lecturer: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SchedulePayload = {
  dayOfWeek: number;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  lecturer?: string | null;
  notes?: string | null;
};

type ScheduleApiResponse<T> = {
  data?: T;
  items?: T;
  entries?: T;
  schedule?: T;
};

export const scheduleQueryKey = (userScope = "anonymous") => ["schedule", userScope] as const;

export const getSchedule = async () => {
  const response = await apiRequest<ScheduleApiResponse<unknown> | unknown>("/schedule");
  return normalizeScheduleList(response);
};

export const createScheduleEntry = async (payload: SchedulePayload) => {
  const response = await apiRequest<ScheduleApiResponse<ScheduleEntry>>("/schedule", {
    method: "POST",
    body: payload,
  });

  return unwrapData(response);
};

export const updateScheduleEntry = async (
  id: string,
  payload: Partial<SchedulePayload>,
) => {
  const response = await apiRequest<ScheduleApiResponse<ScheduleEntry>>(`/schedule/${id}`, {
    method: "PATCH",
    body: payload,
  });

  return unwrapData(response);
};

export const deleteScheduleEntry = async (id: string) => {
  await apiRequest<void>(`/schedule/${id}`, {
    method: "DELETE",
  });
};

const unwrapData = <T>(payload: ScheduleApiResponse<T> | T): T => {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const record = payload as ScheduleApiResponse<T>;

  if (record.data !== undefined) {
    return record.data;
  }

  if (record.items !== undefined) {
    return record.items;
  }

  if (record.entries !== undefined) {
    return record.entries;
  }

  if (record.schedule !== undefined) {
    return record.schedule;
  }

  return payload as T;
};

const dayNamesMap: Record<string, number> = {
  monday: 1,
  poniedzialek: 1,
  wtorek: 2,
  tuesday: 2,
  sroda: 3,
  środa: 3,
  wednesday: 3,
  czwartek: 4,
  thursday: 4,
  piatek: 5,
  piątek: 5,
  friday: 5,
  sobota: 6,
  saturday: 6,
  niedziela: 7,
  sunday: 7,
};

const normalizeDayOfWeek = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value >= 1 && value <= 7) {
      return value;
    }

    if (value >= 0 && value <= 6) {
      return value + 1;
    }
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    const numericValue = Number(trimmedValue);
    if (!Number.isNaN(numericValue)) {
      return normalizeDayOfWeek(numericValue);
    }

    return dayNamesMap[trimmedValue.toLowerCase()] ?? null;
  }

  return null;
};

const normalizeTime = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmedValue = value.trim();
  const match = trimmedValue.match(/^(\d{2}:\d{2})/);
  return match ? match[1] : trimmedValue;
};

const normalizeText = (value: unknown) => {
  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
};

const normalizeScheduleEntry = (value: unknown): ScheduleEntry | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const dayOfWeek = normalizeDayOfWeek(record.dayOfWeek);
  const title = normalizeText(record.title);
  const startTime = normalizeTime(record.startTime);
  const endTime = normalizeTime(record.endTime);

  if (!dayOfWeek || !title || !startTime || !endTime) {
    return null;
  }

  return {
    id: String(record.id ?? ""),
    userId: String(record.userId ?? ""),
    dayOfWeek,
    title,
    startTime,
    endTime,
    location: normalizeText(record.location),
    lecturer: normalizeText(record.lecturer),
    notes: normalizeText(record.notes),
    createdAt: String(record.createdAt ?? ""),
    updatedAt: String(record.updatedAt ?? ""),
  };
};

const normalizeScheduleList = (payload: unknown): ScheduleEntry[] => {
  const unwrapped = unwrapData(payload as ScheduleApiResponse<unknown> | unknown);

  if (!Array.isArray(unwrapped)) {
    return [];
  }

  return unwrapped
    .map((entry) => normalizeScheduleEntry(entry))
    .filter((entry): entry is ScheduleEntry => entry !== null);
};

type ScheduleFieldName =
  | "dayOfWeek"
  | "title"
  | "startTime"
  | "endTime"
  | "location"
  | "lecturer"
  | "notes";

export type ScheduleFieldErrors = Partial<Record<ScheduleFieldName, string>>;

const scheduleFieldNames = new Set<ScheduleFieldName>([
  "dayOfWeek",
  "title",
  "startTime",
  "endTime",
  "location",
  "lecturer",
  "notes",
]);

const toMessage = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const firstMessage = value.map(toMessage).find(Boolean);
    return firstMessage ?? null;
  }

  if (value && typeof value === "object") {
    if ("message" in value) {
      return toMessage(value.message);
    }

    if ("msg" in value) {
      return toMessage(value.msg);
    }
  }

  return null;
};

export const getScheduleErrorState = (error: unknown) => {
  const fieldErrors: ScheduleFieldErrors = {};

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {
        message: "Sesja wygasła. Zaloguj się ponownie.",
        fieldErrors,
      };
    }

    const data = error.data;
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      const validationSource = [record.errors, record.fieldErrors, record.details].find(
        (value) => value && typeof value === "object",
      );

      if (validationSource && typeof validationSource === "object") {
        for (const [key, value] of Object.entries(validationSource)) {
          if (!scheduleFieldNames.has(key as ScheduleFieldName)) {
            continue;
          }

          const message = toMessage(value);
          if (message) {
            fieldErrors[key as ScheduleFieldName] = message;
          }
        }
      }
    }

    return {
      message: error.message,
      fieldErrors,
    };
  }

  if (error instanceof Error && error.message) {
    return {
      message: error.message,
      fieldErrors,
    };
  }

  return {
    message: "Nie udało się zapisać planu zajęć.",
    fieldErrors,
  };
};
