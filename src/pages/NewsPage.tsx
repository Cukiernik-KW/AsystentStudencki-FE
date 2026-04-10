import { useEffect, useMemo, useState } from "react";
import PageSection from "../components/PageSection";
import {
  type FulfillmentTextItem,
  fulfillmentTextsApi,
} from "../lib/api/fulfillmentTextsApi";

const organizationalMessages = [
  {
    title: "Zmiana godzin pracy dziekanatu",
    date: "12 maja 2026",
    text: "W dniach 12-14 maja dziekanat będzie czynny w godzinach 9:00-13:00 z powodu szkoleń pracowników administracji.",
  },
  {
    title: "Przerwa techniczna w systemie studenckim",
    date: "18 maja 2026",
    text: "W sobotę od 7:00 do 11:00 mogą wystąpić utrudnienia w dostępie do systemu rejestracji i płatności.",
  },
  {
    title: "Odbiór legitymacji",
    date: "22 maja 2026",
    text: "Nowe legitymacje studenckie będą wydawane w pokoju 108 po wcześniejszej aktywacji zdjęcia w systemie.",
  },
];

const eventsAndDates = [
  {
    title: "Dzień otwarty uczelni",
    date: "25 maja 2026",
    text: "Spotkania z wykładowcami, prezentacje kierunków i konsultacje dla kandydatów odbędą się w auli głównej od godziny 10:00.",
  },
  {
    title: "Sesja egzaminacyjna",
    date: "10-24 czerwca 2026",
    text: "W tym okresie obowiązuje harmonogram sesji letniej. Szczegółowe terminy egzaminów publikują prowadzący.",
  },
  {
    title: "Zapisy na praktyki",
    date: "1 lipca 2026",
    text: "Od początku lipca ruszają zapisy na praktyki zawodowe dla studentów drugiego i trzeciego roku.",
  },
];

type ContentCard = {
  title: string;
  date?: string;
  text: string;
};

function formatNewsDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function SectionCards({ items }: { items: ContentCard[] }) {
  return (
    <div className="mt-6 grid gap-4">
      {items.map((item) => (
        <article
          key={`${item.title}-${item.date ?? ""}-${item.text}`}
          className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-slate-700"
        >
          {item.date ? <p className="text-sm font-bold text-blue-600">{item.date}</p> : null}
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function GeneralInfoSection({
  backendItems,
  isLoading,
  errorMessage,
}: {
  backendItems: FulfillmentTextItem[];
  isLoading: boolean;
  errorMessage: string | null;
}) {
  const cards = useMemo<ContentCard[]>(
    () =>
      backendItems.map((item, index) => ({
        title: `Informacja ogólna ${index + 1}`,
        date: formatNewsDate(item.createdAt),
        text: item.text,
      })),
    [backendItems],
  );

  return (
    <section className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
        Informacja ogólna
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm leading-7 text-slate-600">Ładowanie komunikatów...</p>
      ) : errorMessage ? (
        <p className="mt-4 text-sm leading-7 text-rose-700">{errorMessage}</p>
      ) : cards.length === 0 ? (
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Brak komunikatów ogólnych do wyświetlenia.
        </p>
      ) : (
        <SectionCards items={cards} />
      )}
    </section>
  );
}

export default function NewsPage() {
  const [backendItems, setBackendItems] = useState<FulfillmentTextItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fulfillmentTextsApi
      .getFulfillmentTexts()
      .then((result) => {
        setBackendItems(result.data ?? []);
      })
      .catch(() => {
        setErrorMessage("Nie udało się pobrać komunikatów ogólnych.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageSection
        pageId="aktualnosci"
        quickPreviewItems={[
          { href: "#komunikaty-organizacyjne", label: "Komunikaty organizacyjne" },
          { href: "#wydarzenia-i-terminy", label: "Wydarzenia i terminy" },
          { href: "#informacje-dla-studentow", label: "Informacje dla studentów i kandydatów" },
        ]}
      />

      <section
        id="komunikaty-organizacyjne"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Komunikaty organizacyjne
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Najważniejsze ogłoszenia administracyjne
        </h2>
        <SectionCards items={organizationalMessages} />
      </section>

      <section
        id="wydarzenia-i-terminy"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Wydarzenia i terminy
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Kalendarz najbliższych wydarzeń
        </h2>
        <SectionCards items={eventsAndDates} />
      </section>

      <section
        id="informacje-dla-studentow"
        className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Informacje dla studentów i kandydatów
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Ważne informacje
        </h2>

        <div className="mt-6 grid gap-4">
          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-slate-700">
            <h3 className="text-xl font-semibold text-slate-900">Informacja dla kandydatów</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Szczegółowe zasady naboru na nowy rok akademicki zostaną opublikowane po zatwierdzeniu harmonogramu rekrutacji.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-slate-700">
            <h3 className="text-xl font-semibold text-slate-900">Informacja dla studentów</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Aktualizacje dotyczące zapisów na przedmioty i organizacji semestru będą pojawiały się na bieżąco w tej sekcji.
            </p>
          </article>
        </div>

        <GeneralInfoSection
          backendItems={backendItems}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />
      </section>
    </div>
  );
}
