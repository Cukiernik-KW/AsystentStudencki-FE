import PageSection from "../components/PageSection";
import {
  type FulfillmentTextsResponse,
  fulfillmentTextsApi,
} from "../lib/api/fulfillmentTextsApi";
import { useState, useEffect } from "react";

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

export default function NewsPage() {
  const [data, setData] = useState<FulfillmentTextsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fulfillmentTextsApi
      .getFulfillmentTexts()
      .then((result) => {
        console.log("TEST", result);
        setData(result);
      })
      .catch(() => {
        setErrorMessage("Nie udało się pobrać aktualności.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <PageSection pageId="aktualnosci" />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Dane z API
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm leading-7 text-slate-600">Ładowanie aktualności...</p>
        ) : errorMessage ? (
          <p className="mt-4 text-sm leading-7 text-rose-700">{errorMessage}</p>
        ) : !data?.data?.length ? (
          <p className="mt-4 text-sm leading-7 text-slate-600">Brak aktualności do wyświetlenia.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {data.data.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-slate-700"
              >
                <p className="text-sm font-bold text-blue-600">
                  {formatNewsDate(item.createdAt)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-700">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
