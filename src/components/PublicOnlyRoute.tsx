import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../zustand/authStore";

export default function PublicOnlyRoute() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!hasHydrated || isAuthLoading) {
    return (
      <div className="mx-auto flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-700">
          Sprawdzanie sesji...
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
