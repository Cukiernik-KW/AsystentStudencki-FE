import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuthStore } from "../zustand/authStore";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Nie udało się zalogować.";
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || "/";
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailPattern.test(email)) {
      setErrorMessage("Podaj poprawny adres e-mail.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    setErrorMessage(null);

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-slate-50 p-8 sm:p-10">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
                Asystent Studencki
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                  Zaloguj się
                </h1>
                <p className="max-w-lg text-base leading-7 text-slate-600">
                  Uzyskaj dostęp do swojego konta i najważniejszych informacji studenckich.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white px-8 py-10 text-slate-900 sm:px-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-email">
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="student@uczelnia.pl"
                  disabled={isAuthLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-password">
                  Hasło
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Minimum 6 znaków"
                  disabled={isAuthLoading}
                />
              </div>

              {errorMessage ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isAuthLoading ? "Logowanie..." : "Zaloguj się"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Nie masz konta?{" "}
              <Link className="font-semibold text-blue-600" to="/register">
                Zarejestruj się
              </Link>
            </p>

            <p className="mt-3 text-sm text-slate-600">
              <Link className="font-semibold text-slate-700 hover:text-blue-600" to="/">
                Wróć na stronę główną
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
