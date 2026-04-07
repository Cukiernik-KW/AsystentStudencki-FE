import { Link } from "react-router-dom";
import { heroCards, pageContent, type PageId } from "../content/sitePages";

type PageSectionProps = {
  pageId: PageId;
};

export default function PageSection({ pageId }: PageSectionProps) {
  const currentPage = pageContent[pageId];

  return (
    <>
      <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70 md:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            {currentPage.eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-900 md:text-6xl">
            {currentPage.title}
          </h1>
          <p className="max-w-2xl text-lg text-slate-700">{currentPage.lead}</p>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">{currentPage.body}</p>
        </div>

        <div className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Szybki podglad
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {currentPage.highlights.map((item) => (
              <li key={item} className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {pageId === "home" && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {heroCards.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm shadow-slate-200/70 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Przejdz do</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Otworz podstrone i uzupelnij ja o docelowe tresci.
              </p>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
