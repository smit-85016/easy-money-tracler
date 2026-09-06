import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearStore,
  newId,
  readStore,
  writeStore,
  type Account,
  type Friend,
  type LedgerEntry,
  type Transaction,
} from "@/lib/local-store";

export type { Account, Friend, LedgerEntry, Transaction };

export type TxKind = "expense" | "income" | "transfer";

/* ---------------------------------- reads --------------------------------- */

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () =>
      readStore()
        .accounts.filter((a) => !a.archived)
        .sort((a, b) => a.sort_order - b.sort_order),
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () =>
      [...readStore().transactions].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)),
  });
}

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => [...readStore().friends].sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export function useLedger() {
  return useQuery({
    queryKey: ["ledger"],
    queryFn: async () =>
      [...readStore().ledger].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)),
  });
}

/* -------------------------------- derived --------------------------------- */

export function accountBalance(account: Account, transactions: Transaction[]): number {
  let total = account.opening_balance;
  for (const tx of transactions) {
    if (tx.kind === "income" && tx.account_id === account.id) total += tx.amount;
    if (tx.kind === "expense" && tx.account_id === account.id) total -= tx.amount;
    if (tx.kind === "transfer") {
      if (tx.account_id === account.id) total -= tx.amount;
      if (tx.to_account_id === account.id) total += tx.amount;
    }
  }
  return total;
}

export function useSummary() {
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const { data: ledger = [] } = useLedger();

  const available = accounts.reduce((sum, a) => sum + accountBalance(a, transactions), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  let spentThisMonth = 0;
  let receivedThisMonth = 0;
  const byCategory = new Map<string, number>();

  for (const tx of transactions) {
    const at = new Date(tx.occurred_at).getTime();
    if (at < monthStart) continue;
    if (tx.kind === "expense") {
      spentThisMonth += tx.amount;
      const key = tx.category ?? "other";
      byCategory.set(key, (byCategory.get(key) ?? 0) + tx.amount);
    }
    if (tx.kind === "income") receivedThisMonth += tx.amount;
  }

  let toReceive = 0;
  let toPay = 0;
  for (const entry of ledger) {
    if (entry.settled_at) continue;
    if (entry.direction === "to_receive") toReceive += entry.amount;
    else toPay += entry.amount;
  }

  const categoryTotals = [...byCategory.entries()]
    .map(([id, amount]) => ({ id, amount }))
    .sort((a, b) => b.amount - a.amount);

  return {
    available,
    spentThisMonth,
    receivedThisMonth,
    toReceive,
    toPay,
    categoryTotals,
    accounts,
    transactions,
  };
}

export function friendTotals(friendId: string, ledger: LedgerEntry[]) {
  let toReceive = 0;
  let toPay = 0;
  for (const e of ledger) {
    if (e.friend_id !== friendId || e.settled_at) continue;
    if (e.direction === "to_receive") toReceive += e.amount;
    else toPay += e.amount;
  }
  return { toReceive, toPay, net: toReceive - toPay };
}

/* ------------------------------- mutations -------------------------------- */

function useInvalidateAll() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["transactions"] });
    void qc.invalidateQueries({ queryKey: ["accounts"] });
    void qc.invalidateQueries({ queryKey: ["friends"] });
    void qc.invalidateQueries({ queryKey: ["ledger"] });
  };
}

export type NewTransaction = {
  kind: TxKind;
  amount: number;
  category?: string | null;
  description?: string | null;
  note?: string | null;
  source?: string | null;
  occurred_at?: string;
  account_id?: string | null;
  to_account_id?: string | null;
};

export function useSaveTransaction() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: NewTransaction & { id?: string }) => {
      const now = new Date().toISOString();
      const id = input.id ?? newId();
      writeStore((data) => {
        const base: Transaction = {
          id,
          kind: input.kind,
          amount: input.amount,
          category: input.category ?? null,
          description: input.description ?? null,
          note: input.note ?? null,
          source: input.source ?? null,
          occurred_at: input.occurred_at ?? now,
          account_id: input.account_id ?? null,
          to_account_id: input.to_account_id ?? null,
          created_at: now,
        };
        const existing = data.transactions.find((t) => t.id === id);
        data.transactions = existing
          ? data.transactions.map((t) => (t.id === id ? { ...base, created_at: t.created_at } : t))
          : [base, ...data.transactions];
        return data;
      });
      return id;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      writeStore((data) => {
        data.transactions = data.transactions.filter((t) => t.id !== id);
        data.ledger = data.ledger.filter((e) => e.transaction_id !== id);
        return data;
      });
    },
    onSuccess: invalidate,
  });
}

export type SplitInput = {
  amount: number;
  category?: string | null;
  description?: string | null;
  note?: string | null;
  account_id?: string | null;
  occurred_at?: string;
  myShare: number;
  shares: { friendId: string; amount: number }[];
};

export function useSaveSplit() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: SplitInput) => {
      const now = new Date().toISOString();
      const at = input.occurred_at ?? now;
      const txId = newId();
      writeStore((data) => {
        data.transactions = [
          {
            id: txId,
            kind: "expense",
            amount: input.amount,
            category: input.category ?? "other",
            description: input.description ?? null,
            note: input.note ?? null,
            source: null,
            occurred_at: at,
            account_id: input.account_id ?? null,
            to_account_id: null,
            created_at: now,
          },
          ...data.transactions,
        ];
        const rows: LedgerEntry[] = input.shares
          .filter((s) => s.amount > 0)
          .map((s) => ({
            id: newId(),
            friend_id: s.friendId,
            transaction_id: txId,
            direction: "to_receive" as const,
            amount: s.amount,
            label: input.description ?? "Split",
            occurred_at: at,
            settled_at: null,
            remind_at: null,
            created_at: now,
          }));
        data.ledger = [...rows, ...data.ledger];
        return data;
      });
      return txId;
    },
    onSuccess: invalidate,
  });
}

export function useAddFriend() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (name: string) => {
      const friend: Friend = {
        id: newId(),
        name: name.trim(),
        phone: null,
        created_at: new Date().toISOString(),
      };
      writeStore((data) => {
        data.friends = [...data.friends, friend];
        return data;
      });
      return friend;
    },
    onSuccess: invalidate,
  });
}

export function useSaveLedgerEntry() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      friend_id: string;
      direction: "to_receive" | "to_pay";
      amount: number;
      label?: string | null;
    }) => {
      const now = new Date().toISOString();
      writeStore((data) => {
        data.ledger = [
          {
            id: newId(),
            friend_id: input.friend_id,
            transaction_id: null,
            direction: input.direction,
            amount: input.amount,
            label: input.label ?? null,
            occurred_at: now,
            settled_at: null,
            remind_at: null,
            created_at: now,
          },
          ...data.ledger,
        ];
        return data;
      });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateLedgerEntry() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      settled_at?: string | null;
      remind_at?: string | null;
    }) => {
      const { id, ...rest } = input;
      writeStore((data) => {
        data.ledger = data.ledger.map((e) => (e.id === id ? { ...e, ...rest } : e));
        return data;
      });
    },
    onSuccess: invalidate,
  });
}

export function useDeleteLedgerEntry() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      writeStore((data) => {
        data.ledger = data.ledger.filter((e) => e.id !== id);
        return data;
      });
    },
    onSuccess: invalidate,
  });
}

export function useAddAccount() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: { name: string; kind: string }) => {
      writeStore((data) => {
        data.accounts = [
          ...data.accounts,
          {
            id: newId(),
            name: input.name.trim(),
            kind: input.kind,
            opening_balance: 0,
            sort_order: data.accounts.length,
            archived: false,
            created_at: new Date().toISOString(),
          },
        ];
        return data;
      });
    },
    onSuccess: invalidate,
  });
}

/**
 * Rename an account and/or set its current balance.
 * `balance` is the balance the user wants to see, so the opening balance is
 * adjusted by the difference the existing transactions already contribute.
 */
export function useUpdateAccount() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: { id: string; name?: string; balance?: number }) => {
      writeStore((data) => {
        data.accounts = data.accounts.map((account) => {
          if (account.id !== input.id) return account;
          const next = { ...account };
          if (input.name && input.name.trim()) next.name = input.name.trim();
          if (typeof input.balance === "number") {
            const activity = accountBalance(account, data.transactions) - account.opening_balance;
            next.opening_balance = input.balance - activity;
          }
          return next;
        });
        return data;
      });
    },
    onSuccess: invalidate,
  });
}

export function useResetAllData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const fresh = clearStore();
      return fresh;
    },
    onSuccess: (fresh) => {
      qc.setQueryData(["transactions"], []);
      qc.setQueryData(["friends"], []);
      qc.setQueryData(["ledger"], []);
      qc.setQueryData(["accounts"], fresh.accounts);
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      void qc.invalidateQueries({ queryKey: ["friends"] });
      void qc.invalidateQueries({ queryKey: ["ledger"] });
      void qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
