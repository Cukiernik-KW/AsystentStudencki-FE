import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../zustand/authStore";

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  topic: "",
  message: "",
};

export default function DeanOfficePage() {
  const userEmail = useAuthStore((state) => state.user?.email ?? "");
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      email: userEmail,
    }));
  }, [userEmail]);

  const updateField = (field: keyof FormState, value: string) => {
    setIsSubmitted(false);
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
    setFormState({
      ...initialFormState,
      email: userEmail,
    });
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
          Dziekanat
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
          Kontakt i obsluga spraw studenckich
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Dziekanat znajduje sie w budynku A, pokoj 204. Godziny pracy dziekanatu:
          poniedzialek-piatek od 8:00 do 14:00.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Telefon</p>
            <p className="mt-2 text-lg font-medium text-slate-900">71 XXX XXX XX</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">E-mail</p>
            <p className="mt-2 text-lg font-medium text-slate-900">dziekanat@XXXXXXX.edu.pl</p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Jakie sprawy zalatwisz w dziekanacie?</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Potwierdzenia i zaswiadczenia dla studentow.</li>
            <li>Informacje o terminach, podaniach i obsludze toku studiow.</li>
            <li>Kontakt w sprawach administracyjnych i organizacyjnych.</li>
          </ul>
        </div>
      </article>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-900 shadow-lg shadow-slate-200/70">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Formularz kontaktowy
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">Napisz do dziekanatu</h2>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dean-name">
              Imie i nazwisko
            </label>
            <input
              id="dean-name"
              type="text"
              value={formState.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="Jan Kowalski"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dean-email">
              Adres e-mail
            </label>
            <input
              id="dean-email"
              type="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="student@uczelnia.pl"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dean-topic">
              Temat
            </label>
            <input
              id="dean-topic"
              type="text"
              value={formState.topic}
              onChange={(event) => updateField("topic", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="Np. prosba o zaswiadczenie"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dean-message">
              Wiadomosc
            </label>
            <textarea
              id="dean-message"
              value={formState.message}
              onChange={(event) => updateField("message", event.target.value)}
              className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="Opisz swoja sprawe."
              required
            />
          </div>

          {isSubmitted ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Formularz zostal wypelniony. Aby wysylac wiadomosci, trzeba jeszcze podlaczyc
              endpoint backendowy lub obsluge e-mail.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Wyslij wiadomosc
          </button>
        </form>
      </aside>
    </section>
  );
}
