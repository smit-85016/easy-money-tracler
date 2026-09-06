import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, GlassCard, SectionLabel } from "@/components/primitives";
import { TransactionRow } from "@/components/transaction-row";
import { formatMoney } from "@/lib/money";
import { useFriends, useLedger, useTransactions, type Transaction } from "@/lib/data";

export const Route = createFileRoute("/received-transactions")({
  head: () => ({
    meta: [
      { title: "To Receive — Worth" },
      { name: "description", content: "All income and money to receive." },
    ],
  }),
  component: ReceivedTransactionsPage,
});

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReceivedTransactionsPage() {
  const { data: allTransactions = [] } = useTransactions();
  const { data: ledger = [] } = useLedger();
  const { data: friends = [] } = useFriends();

  // Combine income transactions and "to receive" friend ledger entries
  const receivedItems = useMemo(() => {
    const friendMap = new Map(friends.map((f) => [f.id, f.name]));

    const incomeTxs: Transaction[] = allTransactions.filter((tx) => tx.kind === "income");

    const toReceiveLedgerTxs: Transaction[] = ledger
      .filter((entry) => entry.direction === "to_receive" && !entry.settled_at)
      .map((entry) => {
        const friendName = friendMap.get(entry.friend_id) ?? "Friend";
        return {
          id: entry.id,
          kind: "income" as const,
          amount: entry.amount,
          category: "income",
          description: entry.label ? `${friendName} · ${entry.label}` : `${friendName} owes you`,
          note: "Pending settlement",
          source: friendName,
          occurred_at: entry.occurred_at,
          account_id: null,
          to_account_id: null,
          created_at: entry.created_at,
        };
      });

    return [...incomeTxs, ...toReceiveLedgerTxs].sort((a, b) =>
      b.occurred_at.localeCompare(a.occurred_at),
    );
  }, [allTransactions, ledger, friends]);

  const toReceivePending = useMemo(
    () =>
      ledger
        .filter((entry) => entry.direction === "to_receive" && !entry.settled_at)
        .reduce((sum, e) => sum + e.amount, 0),
    [ledger],
  );

  const totalReceived = useMemo(
    () => receivedItems.reduce((sum, tx) => sum + tx.amount, 0),
    [receivedItems],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of receivedItems) {
      const key = dayLabel(tx.occurred_at);
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.entries()];
  }, [receivedItems]);

  return (
    <AppShell
      title="To Receive"
      subtitle={`${receivedItems.length} received or pending`}
      backTo="/"
    >
      <GlassCard className="glow-emerald mb-6 px-5 py-5">
        <div className="flex items-center gap-2">
          <ArrowDownLeft className="size-4 text-positive" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Total To Receive & Income
          </p>
        </div>
        <p className="numeric mt-2 text-[32px] font-semibold leading-none text-positive">
          {formatMoney(toReceivePending > 0 ? toReceivePending : totalReceived)}
        </p>
        {toReceivePending > 0 && totalReceived !== toReceivePending ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Pending from friends: {formatMoney(toReceivePending)}
          </p>
        ) : null}
      </GlassCard>

      {groups.length === 0 ? (
        <EmptyState title="No transactions yet. Tap + to add one." />
      ) : (
        <div className="space-y-7">
          {groups.map(([label, items]) => (
            <section key={label}>
              <SectionLabel>{label}</SectionLabel>
              <GlassCard className="divide-y divide-border p-1.5">
                {items.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} ledger={ledger} />
                ))}
              </GlassCard>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
