import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuthStore } from "../zustand/authStore";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    const data = error.data as
      | {
          message?: string;
          errors?: {
            fieldErrors?: Record<string, string[] | undefined>;
          };
        }
      | undefined;

    const fieldErrors = data?.errors?.fieldErrors;
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors).find((messages) => messages?.[0])?.[0]
      : undefined;

    return firstFieldError || data?.message || error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Wystąpił błąd rejestracji.";
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!emailPattern.test(email)) {
      setErrorMessage("Podaj poprawny adres e-mail.");
      return;
    }

    try {
      await register({ email, password });
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-white px-8 py-10 text-slate-900 sm:px-10">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="register-email">
                  E-mail
                </label>
                <input
                  id="register-email"
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
                <label className="text-sm font-medium" htmlFor="register-password">
                  Hasło
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Wpisz hasło"
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
                {isAuthLoading ? "Tworzenie konta..." : "Utwórz konto"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-600">
              Masz już konto?{" "}
              <Link className="font-semibold text-blue-600" to="/login">
                Wróć do logowania
              </Link>
            </p>
          </div>

          <div className="bg-slate-50 p-8 sm:p-10">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
                Rejestracja
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                  Utwórz konto
                </h1>
                <p className="max-w-lg text-base leading-7 text-slate-600">
                  Załóż konto, aby korzystać z najważniejszych funkcji serwisu studenckiego.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
