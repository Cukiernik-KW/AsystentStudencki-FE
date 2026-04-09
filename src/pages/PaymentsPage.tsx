import { useState } from "react";
import PageSection from "../components/PageSection";
import { createCheckoutSession, getPaymentErrorMessage } from "../lib/api/paymentsApi";
import {
  buildOrderId,
  feeCatalog,
  getFeeTypeLabel,
  savePaymentCheckoutContext,
} from "../lib/payments";
import { useAuthStore } from "../zustand/authStore";

export default function PaymentsPage() {
  const user = useAuthStore((state) => state.user);
  const [pendingFeeId, setPendingFeeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async (feeId: string) => {
    const fee = feeCatalog.find((item) => item.id === feeId);
    if (!fee) {
      setErrorMessage("Nie znaleziono konfiguracji dla wybranej opłaty.");
      return;
    }

    const orderId = buildOrderId(fee, user);

    setPendingFeeId(fee.id);
    setErrorMessage(null);

    try {
      const session = await createCheckoutSession({
        orderId,
        feeType: fee.feeType,
      });

      savePaymentCheckoutContext({
        orderId,
        feeType: fee.feeType,
        feeTitle: fee.title,
        createdAt: Date.now(),
      });

      window.location.href = session.url;
    } catch (error) {
      setErrorMessage(getPaymentErrorMessage(error));
      setPendingFeeId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageSection pageId="oplaty" />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Stripe Checkout
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Wybierz opłatę i przejdź do płatności
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            Płatność jest inicjowana po stronie backendu i przekierowuje do bezpiecznej strony
            Stripe Checkout. Status po powrocie zostanie zweryfikowany z backendem.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {feeCatalog.map((fee) => {
            const isPending = pendingFeeId === fee.id;

            return (
              <article
                key={fee.id}
                className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    {getFeeTypeLabel(fee.feeType)}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">{fee.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{fee.description}</p>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                  Order ID zostanie wyliczone automatycznie z typu opłaty i tożsamości
                  zalogowanego użytkownika.
                </div>

                <button
                  type="button"
                  onClick={() => void handleCheckout(fee.id)}
                  disabled={Boolean(pendingFeeId)}
                  className={`mt-6 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
                    isPending ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isPending ? "Przekierowanie..." : fee.ctaLabel}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
