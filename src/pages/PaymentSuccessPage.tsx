import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPaymentErrorMessage, getPaymentStatus, type PaymentStatus } from "../lib/api/paymentsApi";
import {
  clearPaymentCheckoutContext,
  getPaymentCheckoutContext,
  type PaymentCheckoutContext,
} from "../lib/payments";

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20;

type SuccessState =
  | { kind: "missing" }
  | { kind: "loading"; context: PaymentCheckoutContext; attempts: number }
  | { kind: "pending"; context: PaymentCheckoutContext; attempts: number }
  | { kind: "paid"; context: PaymentCheckoutContext }
  | { kind: "cancelled"; context: PaymentCheckoutContext }
  | { kind: "failed"; context: PaymentCheckoutContext }
  | { kind: "error"; context: PaymentCheckoutContext | null; message: string };

const getHeading = (status: PaymentStatus) => {
  if (status === "paid") {
    return "Płatność została potwierdzona";
  }

  if (status === "cancelled") {
    return "Płatność została anulowana";
  }

  if (status === "failed") {
    return "Płatność nie powiodła się";
  }

  return "Czekamy na potwierdzenie płatności";
};

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<SuccessState>(() => {
    const context = getPaymentCheckoutContext();
    return context ? { kind: "loading", context, attempts: 0 } : { kind: "missing" };
  });

  const sessionId = searchParams.get("session_id");

  const context = useMemo(() => getPaymentCheckoutContext(), []);

  useEffect(() => {
    if (!context) {
      setState({ kind: "missing" });
      return;
    }

    let isCancelled = false;
    let timeoutId: number | null = null;
    let attempts = 0;

    const runCheck = async () => {
      attempts += 1;
      setState({
        kind: attempts === 1 ? "loading" : "pending",
        context,
        attempts,
      });

      try {
        const statusResult = await getPaymentStatus(context.orderId);

        if (isCancelled) {
          return;
        }

        const headingStatus = statusResult.status;
        if (headingStatus === "paid") {
          clearPaymentCheckoutContext();
          setState({ kind: "paid", context });
          return;
        }

        if (headingStatus === "cancelled") {
          setState({ kind: "cancelled", context });
          return;
        }

        if (headingStatus === "failed") {
          setState({ kind: "failed", context });
          return;
        }

        if (attempts < MAX_POLL_ATTEMPTS) {
          setState({ kind: "pending", context, attempts });
          timeoutId = window.setTimeout(() => void runCheck(), POLL_INTERVAL_MS);
          return;
        }

        setState({
          kind: "error",
          context,
          message: "Płatność nadal oczekuje na potwierdzenie. Sprawdź status ponownie za chwilę.",
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setState({
          kind: "error",
          context,
          message: getPaymentErrorMessage(error),
        });
      }
    };

    void runCheck();

    return () => {
      isCancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [context]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
        Płatność
      </p>
      <h1 className="mt-4 text-4xl font-black text-slate-900">
        {state.kind === "missing"
          ? "Brak kontekstu płatności"
          : state.kind === "error"
            ? "Nie udało się potwierdzić płatności"
            : getHeading(state.kind)}
      </h1>

      {sessionId ? (
        <p className="mt-4 text-sm text-slate-500">Session ID: {sessionId}</p>
      ) : null}

      {state.kind === "missing" ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Frontend nie znalazł lokalnego kontekstu płatności. Wróć do strony opłat i rozpocznij
          checkout ponownie.
        </p>
      ) : null}

      {state.kind === "loading" || state.kind === "pending" ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Oczekiwanie na potwierdzenie dla: <strong>{state.context.feeTitle}</strong>. Próba{" "}
          {state.attempts} z {MAX_POLL_ATTEMPTS}.
        </p>
      ) : null}

      {state.kind === "paid" ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-700">
          Backend potwierdził status <strong>paid</strong> dla opłaty: {state.context.feeTitle}.
        </p>
      ) : null}

      {state.kind === "cancelled" ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-amber-700">
          Checkout został anulowany przed finalnym potwierdzeniem płatności.
        </p>
      ) : null}

      {state.kind === "failed" ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-rose-700">
          Backend zwrócił status nieudanej płatności. Spróbuj ponownie z poziomu strony opłat.
        </p>
      ) : null}

      {state.kind === "error" ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-rose-700">{state.message}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/oplaty"
          className="rounded-full border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Wróć do opłat
        </Link>
        <Link
          to="/"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </section>
  );
}
