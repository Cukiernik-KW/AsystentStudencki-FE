export type PageId =
  | "home"
  | "rekrutacja"
  | "dziekanat"
  | "oplaty"
  | "plan-zajec"
  | "aktualnosci";

export type NavItem = {
  id: PageId;
  label: string;
  path: string;
  aliases?: string[];
};

export type PageContent = {
  eyebrow: string;
  title: string;
  lead: string;
  body: string;
  highlights: string[];
};

export const navItems: NavItem[] = [
  { id: "home", label: "Strona główna", path: "/" },
  { id: "rekrutacja", label: "Rekrutacja", path: "/rekrutacja" },
  {
    id: "dziekanat",
    label: "Dziekanat",
    path: "/dziekanat",
    aliases: ["Kontakt z dziekanatem", "Kontakt z dziekanatem i administracją"],
  },
  { id: "oplaty", label: "Opłaty", path: "/oplaty" },
  { id: "plan-zajec", label: "Plan zajęć", path: "/plan-zajec" },
  { id: "aktualnosci", label: "Aktualności", path: "/aktualnosci" },
];

export const pageContent: Record<PageId, PageContent> = {
  home: {
    eyebrow: "Centrum informacji",
    title: "Wszystkie najważniejsze sprawy studenckie w jednym miejscu",
    lead: "Szybki dostęp do najczęściej odwiedzanych sekcji serwisu.",
    body:
      "Na stronie głównej znajdziesz najważniejsze informacje dotyczące rekrutacji, dziekanatu, opłat, planu zajęć i aktualności.",
    highlights: [
      "Przejrzysta nawigacja dla kandydatów i studentów",
      "Najważniejsze informacje w jednym miejscu",
      "Szybki dostęp do kluczowych spraw",
    ],
  },
  rekrutacja: {
    eyebrow: "Podstrona",
    title: "Rekrutacja",
    lead: "Informacje dla kandydatów, terminy i wymagane dokumenty.",
    body:
      "W tej sekcji znajdziesz zasady naboru, harmonogram rekrutacji oraz odpowiedzi na najczęściej zadawane pytania kandydatów.",
    highlights: [
      "Wymagane dokumenty",
      "Terminy składania wniosków",
      "Instrukcja procesu rekrutacyjnego",
    ],
  },
  dziekanat: {
    eyebrow: "Podstrona",
    title: "Dziekanat",
    lead: "Kontakt, godziny pracy i sprawy administracyjne.",
    body:
      "Tutaj znajdziesz najważniejsze informacje dotyczące obsługi studentów, składania podań oraz kontaktu z dziekanatem.",
    highlights: [
      "Godziny pracy",
      "Numery telefonów i adresy e-mail",
      "Najczęściej załatwiane sprawy",
    ],
  },
  oplaty: {
    eyebrow: "Podstrona",
    title: "Opłaty",
    lead: "Cennik, terminy płatności i najważniejsze informacje rozliczeniowe.",
    body:
      "W tej sekcji znajdziesz informacje o czesnym, opłatach dodatkowych oraz dostępnych formach płatności.",
    highlights: [
      "Czesne i opłaty dodatkowe",
      "Terminy płatności",
      "Dane do przelewów",
    ],
  },
  "plan-zajec": {
    eyebrow: "Podstrona",
    title: "Plan zajęć",
    lead: "Tygodniowy harmonogram zajęć i najważniejsze zmiany.",
    body:
      "W tej sekcji możesz sprawdzić aktualny plan zajęć, sale, godziny oraz informacje organizacyjne dotyczące harmonogramu.",
    highlights: [
      "Aktualne plany dla studentów",
      "Zmiany sal i godzin",
      "Podział na kierunki i semestry",
    ],
  },
  aktualnosci: {
    eyebrow: "Podstrona",
    title: "Aktualności",
    lead: "Komunikaty uczelni, wydarzenia i ważne ogłoszenia.",
    body:
      "W tym miejscu publikowane są bieżące informacje ważne dla kandydatów, studentów i pracowników uczelni.",
    highlights: [
      "Komunikaty organizacyjne",
      "Wydarzenia i terminy",
      "Informacje dla studentów i kandydatów",
    ],
  },
};

export const heroCards = navItems.filter((item) => item.id !== "home");

const normalizeRouteKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/^#\/?/, "")
    .replace(/^\//, "")
    .replace(/\s+/g, "-");

export const findInternalPath = (value?: string | null) => {
  if (!value) return null;

  if (value === "/") return "/";

  const normalizedValue = normalizeRouteKey(value);

  if (
    normalizedValue.includes("dziekanat") ||
    normalizedValue.includes("kontakt-z-dziekanatem")
  ) {
    return "/dziekanat";
  }

  const matchedItem = navItems.find((item) => {
    const normalizedLabel = normalizeRouteKey(item.label);
    const normalizedPath = normalizeRouteKey(item.path);
    const normalizedId = normalizeRouteKey(item.id);
    const normalizedAliases = item.aliases?.map(normalizeRouteKey) ?? [];

    return (
      normalizedValue === normalizedLabel ||
      normalizedValue === normalizedPath ||
      normalizedValue === normalizedId ||
      normalizedAliases.includes(normalizedValue) ||
      normalizedAliases.some((alias) => normalizedValue.includes(alias) || alias.includes(normalizedValue))
    );
  });

  return matchedItem?.path ?? null;
};
