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
  { id: "home", label: "Strona glowna", path: "/" },
  { id: "rekrutacja", label: "Rekrutacja", path: "/rekrutacja" },
  {
    id: "dziekanat",
    label: "Dziekanat",
    path: "/dziekanat",
    aliases: ["Kontakt z dziekanatem", "Kontakt z dziekanatem i administracja"],
  },
  { id: "oplaty", label: "Oplaty", path: "/oplaty" },
  { id: "plan-zajec", label: "Plan zajec", path: "/plan-zajec" },
  { id: "aktualnosci", label: "Aktualnosci", path: "/aktualnosci" },
];

export const pageContent: Record<PageId, PageContent> = {
  home: {
    eyebrow: "Centrum informacji",
    title: "Wszystkie najwazniejsze sprawy studenckie w jednym miejscu",
    lead:
      "Nowy pasek nawigacyjny prowadzi do najczesciej odwiedzanych sekcji serwisu.",
    body:
      "Na stronie glownej zebrane sa szybkie przejscia do rekrutacji, kontaktu z dziekanatem, informacji o oplatach, planie zajec i biezacych aktualnosciach.",
    highlights: [
      "Przejrzysta nawigacja dla kandydatow i studentow",
      "Czytelne sekcje z najwazniejszymi informacjami",
      "Uklad gotowy do dalszej rozbudowy tresci",
    ],
  },
  rekrutacja: {
    eyebrow: "Podstrona",
    title: "Rekrutacja",
    lead: "Tutaj mozna umiescic etapy naboru, wymagane dokumenty i terminy.",
    body:
      "Sekcja rekrutacyjna jest przygotowana jako osobna podstrona, na ktorej mozna dodac opis kierunkow, harmonogram zapisow oraz odpowiedzi na najczestsze pytania kandydatow.",
    highlights: [
      "Wymagane dokumenty",
      "Terminy skladania wnioskow",
      "Instrukcja procesu rekrutacyjnego",
    ],
  },
  dziekanat: {
    eyebrow: "Podstrona",
    title: "Dziekanat",
    lead: "Miejsce na dane kontaktowe, godziny pracy i sprawy administracyjne.",
    body:
      "Na tej podstronie mozna pokazac informacje o obsludze studentow, zasadach skladania podan oraz formach kontaktu z dziekanatem.",
    highlights: [
      "Godziny pracy",
      "Numery telefonow i adresy e-mail",
      "Najczesciej zalatwiane sprawy",
    ],
  },
  oplaty: {
    eyebrow: "Podstrona",
    title: "Oplaty",
    lead: "Sekcja przeznaczona na cennik, terminy platnosci i zasady rozliczen.",
    body:
      "Podstrona oplat pozwala uporzadkowac informacje o czesnym, oplatach dodatkowych oraz sposobach dokonywania platnosci przez studentow.",
    highlights: [
      "Czesne i oplaty dodatkowe",
      "Terminy platnosci",
      "Dane do przelewow",
    ],
  },
  "plan-zajec": {
    eyebrow: "Podstrona",
    title: "Plan zajec",
    lead: "Przestrzen na harmonogramy zajec dla roznych kierunkow i rocznikow.",
    body:
      "Ta sekcja moze prowadzic do aktualnych planow zajec, podzialu na grupy oraz komunikatow o zmianach w harmonogramie.",
    highlights: [
      "Aktualne plany dla studentow",
      "Zmiany sal i godzin",
      "Podzial na kierunki i semestry",
    ],
  },
  aktualnosci: {
    eyebrow: "Podstrona",
    title: "Aktualnosci",
    lead: "Sekcja na komunikaty uczelni, wydarzenia i ogloszenia organizacyjne.",
    body:
      "Podstrona aktualnosci jest gotowa do publikowania informacji o terminach, wydarzeniach i zmianach waznych dla kandydatow oraz studentow.",
    highlights: [
      "Komunikaty organizacyjne",
      "Wydarzenia i terminy",
      "Informacje dla studentow i kandydatow",
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
