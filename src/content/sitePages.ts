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
    lead:
      "Nowy pasek nawigacyjny prowadzi do najczęściej odwiedzanych sekcji serwisu.",
    body:
      "Na stronie głównej zebrane są szybkie przejścia do rekrutacji, kontaktu z dziekanatem, informacji o opłatach, planie zajęć i bieżących aktualnościach.",
    highlights: [
      "Przejrzysta nawigacja dla kandydatów i studentów",
      "Czytelne sekcje z najważniejszymi informacjami",
      "Układ gotowy do dalszej rozbudowy treści",
    ],
  },
  rekrutacja: {
    eyebrow: "Podstrona",
    title: "Rekrutacja",
    lead: "Tutaj można umieścić etapy naboru, wymagane dokumenty i terminy.",
    body:
      "Sekcja rekrutacyjna jest przygotowana jako osobna podstrona, na której można dodać opis kierunków, harmonogram zapisów oraz odpowiedzi na najczęstsze pytania kandydatów.",
    highlights: [
      "Wymagane dokumenty",
      "Terminy składania wniosków",
      "Instrukcja procesu rekrutacyjnego",
    ],
  },
  dziekanat: {
    eyebrow: "Podstrona",
    title: "Dziekanat",
    lead: "Miejsce na dane kontaktowe, godziny pracy i sprawy administracyjne.",
    body:
      "Na tej podstronie można pokazać informacje o obsłudze studentów, zasadach składania podań oraz formach kontaktu z dziekanatem.",
    highlights: [
      "Godziny pracy",
      "Numery telefonów i adresy e-mail",
      "Najczęściej załatwiane sprawy",
    ],
  },
  oplaty: {
    eyebrow: "Podstrona",
    title: "Opłaty",
    lead: "Sekcja przeznaczona na cennik, terminy płatności i zasady rozliczeń.",
    body:
      "Podstrona opłat pozwala uporządkować informacje o czesnym, opłatach dodatkowych oraz sposobach dokonywania płatności przez studentów.",
    highlights: [
      "Czesne i opłaty dodatkowe",
      "Terminy płatności",
      "Dane do przelewów",
    ],
  },
  "plan-zajec": {
    eyebrow: "Podstrona",
    title: "Plan zajęć",
    lead: "Przestrzeń na harmonogramy zajęć dla różnych kierunków i roczników.",
    body:
      "Ta sekcja może prowadzić do aktualnych planów zajęć, podziału na grupy oraz komunikatów o zmianach w harmonogramie.",
    highlights: [
      "Aktualne plany dla studentów",
      "Zmiany sal i godzin",
      "Podział na kierunki i semestry",
    ],
  },
  aktualnosci: {
    eyebrow: "Podstrona",
    title: "Aktualności",
    lead: "Sekcja na komunikaty uczelni, wydarzenia i ogłoszenia organizacyjne.",
    body:
      "Podstrona aktualności jest gotowa do publikowania informacji o terminach, wydarzeniach i zmianach ważnych dla kandydatów oraz studentów.",
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
