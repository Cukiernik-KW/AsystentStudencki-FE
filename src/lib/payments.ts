import type { AuthUser } from "../zustand/authStore";

export type FeeType = "semester_fee" | "recruitment_fee" | "library_fee";

export type FeeDefinition = {
  id: string;
  title: string;
  description: string;
  feeType: FeeType;
  orderKey: string;
  ctaLabel: string;
};

export type PaymentCheckoutContext = {
  orderId: string;
  feeType: FeeType;
  feeTitle: string;
  createdAt: number;
};

const PAYMENT_CONTEXT_KEY = "payments:last-checkout";

export const feeCatalog: FeeDefinition[] = [
  {
    id: "semester-2026-spring",
    title: "Oplata semestralna",
    description: "Platnosc za aktualny semestr studiow.",
    feeType: "semester_fee",
    orderKey: "semester-2026-spring",
    ctaLabel: "Przejdz do platnosci",
  },
  {
    id: "recruitment-2026",
    title: "Oplata rekrutacyjna",
    description: "Jednorazowa oplata za proces rekrutacji.",
    feeType: "recruitment_fee",
    orderKey: "recruitment-2026",
    ctaLabel: "Oplac rekrutacje",
  },
  {
    id: "library-2026",
    title: "Oplata biblioteczna",
    description: "Platnosc zwiazana z uslugami bibliotecznymi.",
    feeType: "library_fee",
    orderKey: "library-2026",
    ctaLabel: "Oplac biblioteke",
  },
];

const hasWindow = () => typeof window !== "undefined";

const sanitizeOrderScope = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildOrderId = (fee: FeeDefinition, user: AuthUser | null) => {
  const userScope = sanitizeOrderScope(user?.id ?? user?.email ?? "anonymous");
  return `${fee.orderKey}-${userScope}`;
};

export const savePaymentCheckoutContext = (context: PaymentCheckoutContext) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(PAYMENT_CONTEXT_KEY, JSON.stringify(context));
};

export const getPaymentCheckoutContext = (): PaymentCheckoutContext | null => {
  if (!hasWindow()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(PAYMENT_CONTEXT_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as PaymentCheckoutContext;
    if (
      typeof parsed?.orderId === "string" &&
      typeof parsed?.feeType === "string" &&
      typeof parsed?.feeTitle === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
};

export const clearPaymentCheckoutContext = () => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(PAYMENT_CONTEXT_KEY);
};
