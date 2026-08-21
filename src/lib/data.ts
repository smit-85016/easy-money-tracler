import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";

export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Friend = Database["public"]["Tables"]["friends"]["Row"];
export type LedgerEntry = Database["public"]["Tables"]["friend_ledger"]["Row"];

export type TxKind = "expense" | "income" | "transfer";

/* ---------------------------------- reads --------------------------------- */

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("archived", false)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Account[];
    },
  });
}

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useFriends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["friends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Friend[];
    },
  });
}

export function useLedger() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["ledger", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_ledger")
        .select("*")
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data as LedgerEntry[];
    },
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
  const { user } = useAuth();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: NewTransaction & { id?: string }) => {
      if (!user) throw new Error("Not signed in");
      const payload = { ...input, user_id: user.id };
      if (input.id) {
        const { error } = await supabase.from("transactions").update(payload).eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
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
  const { user } = useAuth();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: SplitInput) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          kind: "expense",
          amount: input.amount,
          category: input.category ?? "other",
          description: input.description ?? null,
          note: input.note ?? null,
          account_id: input.account_id ?? null,
          occurred_at: input.occurred_at ?? new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;

      const rows = input.shares
        .filter((s) => s.amount > 0)
        .map((s) => ({
          user_id: user.id,
          friend_id: s.friendId,
          transaction_id: data.id,
          direction: "to_receive" as const,
          amount: s.amount,
          label: input.description ?? "Split",
          occurred_at: input.occurred_at ?? new Date().toISOString(),
        }));
      if (rows.length) {
        const { error: ledgerError } = await supabase.from("friend_ledger").insert(rows);
        if (ledgerError) throw ledgerError;
      }
      return data.id;
    },
    onSuccess: invalidate,
  });
}

export function useAddFriend() {
  const { user } = useAuth();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("friends")
        .insert({ user_id: user.id, name: name.trim() })
        .select("*")
        .single();
      if (error) throw error;
      return data as Friend;
    },
    onSuccess: invalidate,
  });
}

export function useSaveLedgerEntry() {
  const { user } = useAuth();
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (input: {
      friend_id: string;
      direction: "to_receive" | "to_pay";
      amount: number;
      label?: string | null;
    }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("friend_ledger").insert({
        user_id: user.id,
        friend_id: input.friend_id,
        direction: input.direction,
        amount: input.amount,
        label: input.label ?? null,
      });
      if (error) throw error;
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
      const { error } = await supabase.from("friend_ledger").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useDeleteLedgerEntry() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("friend_ledger").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
