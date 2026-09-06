import {
  Utensils,
  ShoppingBag,
  ShoppingBasket,
  Bus,
  GraduationCap,
  Receipt,
  Clapperboard,
  HeartPulse,
  Cable,
  Sparkles,
  ArrowLeftRight,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  id: string;
  label: string;
  icon: LucideIcon;
  tint: string;
};

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food", icon: Utensils, tint: "var(--color-chart-3)" },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, tint: "var(--color-chart-4)" },
  { id: "grocery", label: "Grocery", icon: ShoppingBasket, tint: "var(--color-chart-2)" },
  { id: "travel", label: "Travel", icon: Bus, tint: "var(--color-chart-5)" },
  { id: "college", label: "College", icon: GraduationCap, tint: "var(--color-chart-1)" },
  { id: "bills", label: "Recharge/Bills", icon: Receipt, tint: "var(--color-chart-5)" },
  { id: "fun", label: "Entertainment", icon: Clapperboard, tint: "var(--color-chart-4)" },
  { id: "health", label: "Health", icon: HeartPulse, tint: "var(--color-destructive)" },
  { id: "electronics", label: "Electronics", icon: Cable, tint: "var(--color-chart-1)" },
  { id: "other", label: "Other", icon: Sparkles, tint: "var(--color-muted-foreground)" },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

export function categoryOf(id: string | null | undefined): Category {
  if (!id) return CATEGORIES[CATEGORIES.length - 1]!;
  return (
    CATEGORY_MAP.get(id) ?? {
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      icon: Sparkles,
      tint: "var(--color-muted-foreground)",
    }
  );
}

export const INCOME_META = { label: "Money Received", icon: Wallet, tint: "var(--color-positive)" };
export const TRANSFER_META = {
  label: "Transfer",
  icon: ArrowLeftRight,
  tint: "var(--color-muted-foreground)",
};
