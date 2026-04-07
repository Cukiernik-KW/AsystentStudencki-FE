import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import ChatToggle from "./ChatToggle";
import { navItems } from "../content/sitePages";
import { useAuthStore } from "../zustand/authStore";

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-4 lg:flex-wrap lg:justify-between lg:gap-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otworz menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <Link
            to="/"
            className="min-w-0 flex-1 text-left lg:min-w-fit lg:flex-none"
            aria-label="Przejdz do strony glownej"
          >
            <span className="block text-xs uppercase tracking-[0.4em] text-blue-600">
              STUDENCKI
            </span>
            <span className="block text-lg font-semibold text-slate-900">Panel informacyjny</span>
          </Link>

          <nav className="hidden flex-wrap justify-end gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                  }`
                }
                end={item.path === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {isAuthenticated ? (
            <div className="relative ml-auto text-sm">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((value) => !value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-left leading-tight text-slate-700 transition hover:border-slate-300 hover:bg-white"
                aria-expanded={isAccountMenuOpen}
                aria-label="Otworz menu konta"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Konto
                </div>
                <div className="mt-1 font-medium text-slate-800">{user?.email}</div>
              </button>

              {isAccountMenuOpen ? (
                <div className="absolute right-0 top-full z-20 mt-2 min-w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/80">
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isAuthLoading}
                    className="w-full rounded-xl px-4 py-2 text-left font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Wyloguj
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ml-auto rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Zaloguj sie
            </button>
          )}
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`
                    }
                    end={item.path === "/"}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {isAuthenticated ? (
                <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setIsAccountMenuOpen((value) => !value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-700"
                    aria-expanded={isAccountMenuOpen}
                  >
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Konto
                    </div>
                    <div className="mt-1 font-medium text-slate-800">{user?.email}</div>
                  </button>
                  {isAccountMenuOpen ? (
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={isAuthLoading}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Wyloguj
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-2xl border border-blue-600 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Zaloguj sie
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <Outlet />
      </main>

      <ChatToggle />
    </div>
  );
}
