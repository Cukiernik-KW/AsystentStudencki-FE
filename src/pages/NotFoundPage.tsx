import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">404</p>
      <h1 className="mt-4 text-4xl font-black text-slate-900">Nie znaleziono strony</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        Ten adres nie prowadzi do zadnej podstrony. Wroc do strony glownej i wybierz
        poprawna sekcje z nawigacji.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Wroc na strone glowna
      </Link>
    </section>
  );
}
