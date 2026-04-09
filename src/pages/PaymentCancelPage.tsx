import { Link } from "react-router-dom";
import { clearPaymentCheckoutContext, getPaymentCheckoutContext } from "../lib/payments";

export default function PaymentCancelPage() {
  const context = getPaymentCheckoutContext();

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
        Płatność
      </p>
      <h1 className="mt-4 text-4xl font-black text-slate-900">Płatność została anulowana</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        {context
          ? `Nie zakończono checkoutu dla opłaty: ${context.feeTitle}. Możesz wrócić i spróbować ponownie.`
          : "Checkout nie został zakończony. Możesz wrócić do strony opłat i rozpocząć go jeszcze raz."}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/oplaty"
          onClick={() => clearPaymentCheckoutContext()}
          className="rounded-full border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Spróbuj ponownie
        </Link>
        <Link
          to="/"
          onClick={() => clearPaymentCheckoutContext()}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </section>
  );
}
