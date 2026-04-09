import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { hasValidConfig, sendToBot } from "../lib/api/useChatbotAPI";
import { findInternalPath } from "../content/sitePages";
import { useChatSessionStore } from "../zustand/chatSessionStore";

type RichValue =
  | null
  | string
  | number
  | boolean
  | {
      stringValue?: string;
      numberValue?: number;
      boolValue?: boolean;
      structValue?: { fields?: Record<string, RichValue> };
      listValue?: { values?: RichValue[] };
      [key: string]: unknown;
    };

type RichContentItem = {
  type?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  value?: string;
  label?: string;
  link?: string;
  options?: RichContentItem[];
};

type ChatMessage = {
  type: "bot" | "user";
  text?: string;
  richContent?: RichContentItem[][];
};

type ChatRequestError = {
  isError?: boolean;
  code?: number;
  message?: string;
};

const dfValueToJs = (value: RichValue): unknown => {
  if (value == null) {
    return null;
  }

  if (typeof value !== "object") {
    return value;
  }

  if ("structValue" in value && value.structValue?.fields) {
    const out: Record<string, unknown> = {};
    for (const [key, fieldValue] of Object.entries(value.structValue.fields)) {
      out[key] = dfValueToJs(fieldValue);
    }
    return out;
  }

  if ("listValue" in value && value.listValue?.values) {
    return value.listValue.values.map(dfValueToJs);
  }

  if ("stringValue" in value) {
    return value.stringValue ?? null;
  }

  if ("numberValue" in value) {
    return value.numberValue ?? null;
  }

  if ("boolValue" in value) {
    return value.boolValue ?? null;
  }

  return value;
};

const normalizeRichContent = (raw: unknown): RichContentItem[][] | null => {
  if (!raw) {
    return null;
  }

  let source = raw;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return null;
    }
  }

  const content = dfValueToJs(source as RichValue);

  if (Array.isArray(content)) {
    if (Array.isArray(content[0])) {
      return content as RichContentItem[][];
    }

    if (content.length && typeof content[0] === "object") {
      return [content as RichContentItem[]];
    }
  }

  return null;
};

const createResponseArray = (response: Awaited<ReturnType<typeof sendToBot>>): ChatMessage[] => {
  const out: ChatMessage[] = [];

  for (const message of response) {
    if (message.text) {
      out.push({ type: "bot", text: message.text });
    }

    const richContent = normalizeRichContent(message.richContent);
    if (richContent) {
      out.push({ type: "bot", richContent });
    }
  }

  if (out.length === 0) {
    out.push({ type: "bot", text: "[Brak odpowiedzi]" });
  }

  return out;
};

const normalizeActionValue = (value?: string | null) =>
  value
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim() ?? "";

const collectItemStrings = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectItemStrings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectItemStrings);
  }

  return [];
};

export default function ChatToggle() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ensureSessionId = useChatSessionStore((state) => state.ensureSessionId);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", text: "Witaj! Kliknij przycisk ponizej, aby rozpoczac rozmowe." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [session, setSession] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setSession(ensureSessionId());
  }, [ensureSessionId]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [messages, open, isTyping]);

  useEffect(() => {
    if (open && isConversationStarted && !disabled) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, isConversationStarted, disabled]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sendWithRetry = async (text: string, attempts = 10): Promise<ChatMessage[]> => {
    let lastError: ChatRequestError | null = null;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await sendToBot(text, session);
        return createResponseArray(response);
      } catch (error) {
        const normalizedError =
          error && typeof error === "object"
            ? (error as ChatRequestError)
            : { message: "Blad komunikacji z serwerem" };

        lastError = normalizedError;

        if (
          normalizedError.code &&
          (normalizedError.code === 429 ||
            (normalizedError.code >= 500 && normalizedError.code < 600))
        ) {
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
          continue;
        }

        break;
      }
    }

    const message = lastError?.message ?? "Blad komunikacji z serwerem";
    setError(message);
    setMessages((current) => [...current, { type: "bot", text: `Blad: ${message}` }]);
    return [];
  };

  const submitMessage = async (text: string, options?: { unlockInput?: boolean }) => {
    const normalizedText = text.trim();

    if (!normalizedText || disabled) {
      return;
    }

    setError("");
    setDisabled(true);
    setIsTyping(true);

    if (!hasValidConfig()) {
      setIsTyping(false);
      setDisabled(false);
      setMessages((current) => [
        ...current,
        {
          type: "bot",
          text: "Brak konfiguracji czatu w pliku .env. Uzupełnij ustawienia i odśwież aplikację.",
        },
      ]);
      return;
    }

    if (options?.unlockInput) {
      setIsConversationStarted(true);
    }

    setMessages((current) => [...current, { type: "user", text: normalizedText }]);

    const botMessages = await sendWithRetry(normalizedText);
    setMessages((current) => [...current, ...botMessages]);

    setIsTyping(false);
    setDisabled(false);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSend = async (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    const text = input.trim();

    if (!isConversationStarted) {
      return;
    }

    setInput("");
    await submitMessage(text);
  };

  const handleStartConversation = async () => {
    await submitMessage("Cze\u015B\u0107", { unlockInput: true });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const resolveInternalRoute = (item: RichContentItem) => {
    const normalizedItemContent = collectItemStrings(item).map(normalizeActionValue).join(" ");
    if (
      normalizedItemContent.includes("kontakt z dziekanatem") ||
      normalizedItemContent.includes("dziekanat")
    ) {
      return "/dziekanat";
    }
    if (
      collectItemStrings(item).some((value) => value.includes("Op\u0142aty")) ||
      normalizedItemContent.includes("oplaty") ||
      normalizedItemContent.includes("oplata")
    ) {
      return "/oplaty";
    }

    const candidates = [item.link, item.value, item.text, item.title, item.label];

    for (const candidate of candidates) {
      if (typeof candidate !== "string") {
        continue;
      }

      const normalizedCandidate = normalizeActionValue(candidate);
      if (
        normalizedCandidate.includes("kontakt z dziekanatem") ||
        normalizedCandidate.includes("dziekanat")
      ) {
        return "/dziekanat";
      }
      if (
        candidate.includes("Op\u0142aty") ||
        normalizedCandidate.includes("oplaty") ||
        normalizedCandidate.includes("oplata")
      ) {
        return "/oplaty";
      }

      const matchedPath = findInternalPath(candidate);
      if (matchedPath) {
        return matchedPath;
      }

      if (candidate.startsWith("/")) {
        return candidate;
      }

      try {
        const url = new URL(candidate);
        if (url.origin === window.location.origin) {
          return `${url.pathname}${url.search}${url.hash}`;
        }
      } catch {
        // Ignore invalid URLs and continue to the next candidate.
      }
    }

    return null;
  };

  const handleRichClick = async (item: RichContentItem) => {
    const internalPath = resolveInternalRoute(item);
    if (internalPath) {
      navigate(internalPath);
      return;
    }

    if (item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
      return;
    }

    const text = item.value ?? item.text ?? item.title ?? item.label ?? "OK";
    setError("");
    setMessages((current) => [...current, { type: "user", text }]);
    setIsTyping(true);

    const botMessages = await sendWithRetry(text);
    setMessages((current) => [...current, ...botMessages]);
    setIsTyping(false);
  };

  const renderRichContent = (richContent: RichContentItem[][]): ReactNode =>
    richContent.map((row, rowIndex) => {
      const safeRow = Array.isArray(row) ? row : [];
      const description = safeRow.find((item) => item?.type === "description" && item?.title);
      const others = safeRow.filter((item) => item !== description);

      return (
        <div key={rowIndex} className="mt-2">
          {description?.title ? (
            <div className="mb-2 text-sm text-gray-900">
              {description.title}
              {description.subtitle ? (
                <div className="text-gray-600">{description.subtitle}</div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {others.map((item, itemIndex) => {
              if (item?.type === "chips" && Array.isArray(item.options)) {
                return item.options.map((option, optionIndex) => (
                  <button
                    key={`${itemIndex}-${optionIndex}`}
                    onClick={() => void handleRichClick(option)}
                    className="cursor-pointer rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800 hover:bg-gray-300"
                    title={option.value ?? option.text}
                    type="button"
                  >
                    {option.text ?? option.title ?? option.label}
                  </button>
                ));
              }

              if (item?.type === "button") {
                return (
                  <button
                    key={itemIndex}
                    onClick={() => void handleRichClick(item)}
                    className="cursor-pointer rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    title={item.value ?? item.text}
                    type="button"
                  >
                    {item.text ?? item.title ?? "Wybierz"}
                  </button>
                );
              }

              if (item?.type === "info" && (item.title || item.subtitle)) {
                return (
                  <div
                    key={itemIndex}
                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-800"
                  >
                    {item.title ? <div className="font-medium">{item.title}</div> : null}
                    {item.subtitle ? <div className="text-gray-600">{item.subtitle}</div> : null}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      );
    });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-2xl hover:bg-blue-700"
        onClick={() => setOpen((value) => !value)}
        aria-label="Otwórz czat"
        type="button"
      >
        Chat
      </button>

      {open ? (
        <div className="mt-3 flex h-96 w-80 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="font-semibold text-black">Live chat</div>
            <button
              className="cursor-pointer text-gray-500 hover:text-black"
              onClick={() => setOpen(false)}
              aria-label="Zamknij"
              type="button"
            >
              X
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-2 overflow-y-auto p-3 text-sm text-gray-800"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.type}-${index}`}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    message.type === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.text ? <div>{message.text}</div> : null}
                  {Array.isArray(message.richContent) ? renderRichContent(message.richContent) : null}
                </div>
              </div>
            ))}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-3 py-2 text-gray-900">
                  <span className="inline-flex items-center gap-1">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse [animation-delay:150ms]">.</span>
                    <span className="animate-pulse [animation-delay:300ms]">.</span>
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="border-t border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}

          {!isConversationStarted ? (
            <div className="border-t px-3 pt-2 pb-1">
              <button
                type="button"
                onClick={() => void handleStartConversation()}
                disabled={disabled}
                className={`w-full rounded-lg px-3 py-2 text-sm font-medium text-white ${
                  disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {"Cze\u015B\u0107"}
              </button>
            </div>
          ) : null}

          <form className="flex gap-2 border-t p-2" onSubmit={(event) => void handleSend(event)}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:ring"
              placeholder="Wpisz wiadomość..."
              disabled={disabled || !isConversationStarted}
            />
            <button
              type="submit"
              disabled={disabled || !isConversationStarted}
              className={`rounded-lg px-3 py-2 text-sm text-white ${
                disabled || !isConversationStarted ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {t("chat.send_message")}
            </button>
          </form>

          {!isConversationStarted ? (
            <div className="px-3 pb-3 text-xs leading-relaxed text-gray-500">
              Najpierw rozpocznij rozmowę przyciskiem {"Cze\u015B\u0107"}. Rozpoczynając czat,
              akceptujesz politykę prywatności.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
