import { create } from "zustand";

const makeSessionId = () =>
  `s_${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

type ChatSessionStoreState = {
  sessionId: string | null;
  sessionIdExpiry: number | null;
  ensureSessionId: () => string;
};

export const useChatSessionStore = create<ChatSessionStoreState>((set, get) => ({
  sessionId: null,
  sessionIdExpiry: null,

  ensureSessionId: () => {
    const { sessionId, sessionIdExpiry } = get();

    if (!sessionId || (sessionIdExpiry !== null && Date.now() > sessionIdExpiry)) {
      const nextSessionId = makeSessionId();
      set({
        sessionId: nextSessionId,
        sessionIdExpiry: Date.now() + 60 * 60 * 1000,
      });
      return nextSessionId;
    }

    return sessionId;
  },
}));
