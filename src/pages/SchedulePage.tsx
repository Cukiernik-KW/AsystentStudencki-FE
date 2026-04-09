import { useQuery } from "@tanstack/react-query";
import {
  getSchedule,
  getScheduleErrorState,
  scheduleQueryKey,
  type ScheduleEntry,
} from "../lib/api/scheduleApi";
import { useAuthStore } from "../zustand/authStore";

const dayOptions = [
  { value: 1, label: "Poniedziałek" },
  { value: 2, label: "Wtorek" },
  { value: 3, label: "Środa" },
  { value: 4, label: "Czwartek" },
  { value: 5, label: "Piątek" },
  { value: 6, label: "Sobota" },
  { value: 7, label: "Niedziela" },
];

const compareTime = (left: string, right: string) => left.localeCompare(right);

const sortEntries = (entries: ScheduleEntry[]) =>
  [...entries].sort((left, right) => {
    if (left.dayOfWeek !== right.dayOfWeek) {
      return left.dayOfWeek - right.dayOfWeek;
    }

    const timeOrder = compareTime(left.startTime, right.startTime);
    if (timeOrder !== 0) {
      return timeOrder;
    }

    return left.title.localeCompare(right.title, "pl");
  });

const groupByDay = (entries: ScheduleEntry[]) =>
  dayOptions.map((day) => ({
    ...day,
    entries: sortEntries(entries).filter((entry) => entry.dayOfWeek === day.value),
  }));

export default function SchedulePage() {
  const user = useAuthStore((state) => state.user);
  const userScope = user?.id ?? user?.email ?? "anonymous";

  const scheduleQuery = useQuery({
    queryKey: scheduleQueryKey(userScope),
    queryFn: getSchedule,
  });

  const groupedSchedule = groupByDay(scheduleQuery.data ?? []);

  return (
    <section className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          Plan zajęć
        </p>
        <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
          Tygodniowy harmonogram
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Widok jest tylko do odczytu. Dane pobierane są z chronionego endpointu
          `/api/schedule` i grupowane po dniach tygodnia.
        </p>
      </div>

      {scheduleQuery.isLoading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Ładowanie planu zajęć...
        </div>
      ) : null}

      {scheduleQuery.isError ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {getScheduleErrorState(scheduleQuery.error).message}
        </div>
      ) : null}

      {!scheduleQuery.isLoading && !scheduleQuery.isError ? (
        <div className="grid gap-4">
          {groupedSchedule.map((group) => (
            <section
              key={group.value}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">{group.label}</h2>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  {group.entries.length} wpisów
                </span>
              </div>

              {group.entries.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
                  Brak zajęć w tym dniu.
                </p>
              ) : (
                <div className="grid gap-3">
                  {group.entries.map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                            {entry.startTime} - {entry.endTime}
                          </span>
                          {entry.location ? (
                            <span className="text-sm text-slate-600">{entry.location}</span>
                          ) : null}
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900">{entry.title}</h3>

                        <div className="space-y-1 text-sm text-slate-600">
                          {entry.lecturer ? <p>Prowadzący: {entry.lecturer}</p> : null}
                          {entry.notes ? <p className="leading-6 text-slate-500">{entry.notes}</p> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      ) : null}
    </section>
  );
}
