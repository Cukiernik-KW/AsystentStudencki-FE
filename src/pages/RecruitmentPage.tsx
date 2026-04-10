import PageSection from "../components/PageSection";

const requiredDocuments = [
  "świadectwo ukończenia szkoły średniej lub dyplom ukończenia studiów",
  "dowód osobisty lub paszport do wglądu",
  "aktualne zdjęcie do systemu rekrutacyjnego",
];

const applicationDeadlines = [
  { date: "1 czerwca 2026", text: "Start elektronicznej rejestracji kandydatów." },
  { date: "31 lipca 2026", text: "Ostateczny termin wniesienia opłaty rekrutacyjnej." },
  { date: "8 sierpnia 2026", text: "Publikacja list zakwalifikowanych." },
];

const recruitmentSteps = [
  "Załóż konto w systemie rekrutacyjnym i wybierz kierunek.",
  "Uzupełnij formularz oraz dołącz wymagane dokumenty.",
  "Opłać rekrutację i śledź status zgłoszenia.",
];

export default function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <PageSection
        pageId="rekrutacja"
        quickPreviewItems={[
          { href: "#wymagane-dokumenty", label: "Wymagane dokumenty" },
          { href: "#terminy-skladania-wnioskow", label: "Terminy składania wniosków" },
          { href: "#instrukcja-rekrutacji", label: "Instrukcja procesu rekrutacyjnego" },
        ]}
      />

      <section
        id="wymagane-dokumenty"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Wymagane dokumenty
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Przygotuj komplet dokumentów
        </h2>
        <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
          {requiredDocuments.map((item) => (
            <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        id="terminy-skladania-wnioskow"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Terminy składania wniosków
        </p>
        <div className="mt-6 grid gap-4">
          {applicationDeadlines.map((item) => (
            <article
              key={item.date}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
            >
              <p className="text-sm font-bold text-blue-600">{item.date}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="instrukcja-rekrutacji"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Instrukcja procesu rekrutacyjnego
        </p>
        <ol className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
          {recruitmentSteps.map((item, index) => (
            <li
              key={item}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <span className="mr-2 font-semibold text-slate-900">{index + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
