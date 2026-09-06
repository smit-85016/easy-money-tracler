import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, GlassCard, SectionLabel } from "@/components/primitives";
import { TransactionRow } from "@/components/transaction-row";
import { formatMoney } from "@/lib/money";
import { useFriends, useLedger, type Transaction } from "@/lib/data";

export const Route = createFileRoute("/to-pay-transactions")({
  head: () => ({
    meta: [
      { title: "To Pay — Worth" },
      { name: "description", content: "All pending payments and who you owe." },
    ],
  }),
  component: ToPayTransactionsPage,
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

function ToPayTransactionsPage() {
  const { data: ledger = [] } = useLedger();
  const { data: friends = [] } = useFriends();

  // Filter only "to pay" transactions (who I owe)
  const toPayItems = useMemo(() => {
    const friendMap = new Map(friends.map((f) => [f.id, f.name]));

    const pendingLedger = ledger.filter(
      (entry) => entry.direction === "to_pay" && !entry.settled_at,
    );

    const txs: Transaction[] = pendingLedger.map((entry) => {
      const friendName = friendMap.get(entry.friend_id) ?? "Friend";
      return {
        id: entry.id,
        kind: "expense" as const,
        amount: entry.amount,
        category: "other",
        description: entry.label ? `Owe ${friendName} · ${entry.label}` : `Owe ${friendName}`,
        note: "To pay",
        source: null,
        occurred_at: entry.occurred_at,
        account_id: null,
        to_account_id: null,
        created_at: entry.created_at,
      };
    });

    return txs.sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  }, [ledger, friends]);

  const totalToPay = useMemo(
    () => toPayItems.reduce((sum, tx) => sum + tx.amount, 0),
    [toPayItems],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of toPayItems) {
      const key = dayLabel(tx.occurred_at);
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.entries()];
  }, [toPayItems]);

  return (
    <AppShell title="To Pay" subtitle={`${toPayItems.length} pending obligations`} backTo="/">
      <GlassCard className="glow-amber mb-6 px-5 py-5">
        <div className="flex items-center gap-2">
          <Wallet className="size-4 text-warning" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Total To Pay
          </p>
        </div>
        <p className="numeric mt-2 text-[32px] font-semibold leading-none text-warning">
          {formatMoney(totalToPay)}
        </p>
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
