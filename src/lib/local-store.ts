/**
 * Offline-first local store. Everything lives in the browser (localStorage),
 * so the app needs no account and works fully offline.
 */

export type Account = {
  id: string;
  name: string;
  kind: string;
  opening_balance: number;
  sort_order: number;
  archived: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  kind: "expense" | "income" | "transfer";
  amount: number;
  category: string | null;
  description: string | null;
  note: string | null;
  source: string | null;
  occurred_at: string;
  account_id: string | null;
  to_account_id: string | null;
  created_at: string;
};

export type Friend = {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
};

export type LedgerEntry = {
  id: string;
  friend_id: string;
  transaction_id: string | null;
  direction: "to_receive" | "to_pay";
  amount: number;
  label: string | null;
  occurred_at: string;
  settled_at: string | null;
  remind_at: string | null;
  created_at: string;
};

export type StoreData = {
  accounts: Account[];
  transactions: Transaction[];
  friends: Friend[];
  ledger: LedgerEntry[];
};

const KEY = "paise.store.v1";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function initialStore(): StoreData {
  const now = new Date().toISOString();
  return {
    accounts: [
      {
        id: "acc-bank",
        name: "Bank",
        kind: "bank",
        opening_balance: 0,
        sort_order: 0,
        archived: false,
        created_at: now,
      },
      {
        id: "acc-cash",
        name: "Cash",
        kind: "cash",
        opening_balance: 0,
        sort_order: 1,
        archived: false,
        created_at: now,
      },
    ],
    transactions: [],
    friends: [],
    ledger: [],
  };
}

const empty: StoreData = { accounts: [], transactions: [], friends: [], ledger: [] };

export function readStore(): StoreData {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const fresh = initialStore();
      window.localStorage.setItem(KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      accounts:
        parsed.accounts && parsed.accounts.length > 0
          ? parsed.accounts.map((a) => ({ ...a, opening_balance: a.opening_balance ?? 0 }))
          : initialStore().accounts,
      transactions: parsed.transactions ?? [],
      friends: parsed.friends ?? [],
      ledger: parsed.ledger ?? [],
    };
  } catch {
    return initialStore();
  }
}

export function clearStore(): StoreData {
  const fresh = initialStore();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
      window.localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      /* localStorage error */
    }
  }
  return fresh;
}

export function writeStore(update: (data: StoreData) => StoreData | void): StoreData {
  const current = readStore();
  const next = update(current) ?? current;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
