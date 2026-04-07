import { axiosErrorHandler, customAxios } from "./customAxios";

export type TDialogFlowRes = {
  type: "bot";
  richContent?: unknown;
  text?: string;
};

const cfg = {
  lang: import.meta.env.VITE_DFX_LANG || "pl",
};

type ChatMessage = {
  message?: string;
  reply?: string;
  response?: string;
  text?: {
    text?: string[];
  } | string;
  payload?: {
    fields?: {
      richContent?: unknown;
      rich_content?: unknown;
    };
    richContent?: unknown;
    rich_content?: unknown;
  };
  richContent?: unknown;
  rich_content?: unknown;
};

type ChatResponse = {
  messages?: ChatMessage[];
  data?: ChatMessage[] | ChatMessage | string;
  message?: string;
  reply?: string;
  response?: string;
};

const toChatMessages = (payload: ChatResponse | ChatMessage[] | ChatMessage | string | null | undefined) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload === "string") {
    return [{ text: payload }];
  }

  if (Array.isArray(payload.messages)) {
    return payload.messages;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (typeof payload.message === "string") {
    return [{ text: payload.message }];
  }

  if (typeof payload.reply === "string") {
    return [{ text: payload.reply }];
  }

  if (typeof payload.response === "string") {
    return [{ text: payload.response }];
  }

  if (typeof payload.data === "string") {
    return [{ text: payload.data }];
  }

  if ("text" in payload || "payload" in payload || "richContent" in payload || "rich_content" in payload) {
    return [payload];
  }

  return [];
};

export const hasValidConfig = () => Boolean(cfg.lang);

export async function sendToBot(text: string, sessionId: string): Promise<TDialogFlowRes[]> {
  try {
    const response = await customAxios.post<ChatResponse>("/chat", {
      text,
      sessionId,
    });

    const messages = toChatMessages(response.data);
    const out: TDialogFlowRes[] = [];

    for (const message of messages) {
      const normalizedText =
        typeof message?.text === "string"
          ? message.text
          : message?.text?.text?.[0] ??
            message?.message ??
            message?.reply ??
            message?.response ??
            null;

      if (normalizedText) {
        out.push({ type: "bot", text: normalizedText });
      }

      const richContent =
        message?.payload?.fields?.richContent ??
        message?.payload?.fields?.rich_content ??
        message?.payload?.richContent ??
        message?.payload?.rich_content ??
        message?.richContent ??
        message?.rich_content ??
        null;

      if (richContent) {
        out.push({ type: "bot", richContent });
      }
    }

    if (out.length === 0) {
      out.push({ type: "bot", text: "[Brak odpowiedzi]" });
    }

    return out;
  } catch (error) {
    throw axiosErrorHandler(error);
  }
}
