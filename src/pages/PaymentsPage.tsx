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

const paymentDeadlines = [
  { label: "Czesne za semestr letni", deadline: "15 lutego 2026", note: "Płatność jednorazowa lub pierwsza rata." },
  { label: "Opłata rekrutacyjna", deadline: "31 lipca 2026", note: "Warunek udziału w postępowaniu rekrutacyjnym." },
  { label: "Opłata biblioteczna", deadline: "15 października 2026", note: "Dotyczy wydania i aktywacji karty bibliotecznej." },
];

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
      <PageSection
        pageId="oplaty"
        quickPreviewItems={[
          { href: "#czesne-i-oplaty", label: "Czesne i opłaty" },
          { href: "#terminy-platnosci", label: "Terminy płatności" },
        ]}
      />

      <section
        id="czesne-i-oplaty"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Czesne i opłaty
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Wybierz opłatę i przejdź do płatności
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            W tej sekcji możesz opłacić najważniejsze należności związane z tokiem studiów.
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

      <section
        id="terminy-platnosci"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Terminy płatności
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Harmonogram najbliższych wpłat
          </h2>
        </div>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Rodzaj opłaty</th>
                <th className="px-4 py-3 font-semibold">Termin</th>
                <th className="px-4 py-3 font-semibold">Uwagi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-600">
              {paymentDeadlines.map((item) => (
                <tr key={item.label}>
                  <td className="px-4 py-4 font-medium text-slate-900">{item.label}</td>
                  <td className="px-4 py-4">{item.deadline}</td>
                  <td className="px-4 py-4">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
