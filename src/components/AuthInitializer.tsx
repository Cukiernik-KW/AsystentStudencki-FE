import { useEffect, useRef } from "react";
import { useAuthStore } from "../zustand/authStore";

export default function AuthInitializer() {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    void refreshSession();
  }, [refreshSession]);

  return null;
}
