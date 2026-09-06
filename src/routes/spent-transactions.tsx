import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, GlassCard, SectionLabel } from "@/components/primitives";
import { TransactionRow } from "@/components/transaction-row";
import { formatMoney } from "@/lib/money";
import { useLedger, useTransactions, type Transaction } from "@/lib/data";

export const Route = createFileRoute("/spent-transactions")({
  head: () => ({
    meta: [
      { title: "All Spent — Worth" },
      { name: "description", content: "All your spending and debit transactions." },
    ],
  }),
  component: SpentTransactionsPage,
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

function SpentTransactionsPage() {
  const { data: allTransactions = [] } = useTransactions();
  const { data: ledger = [] } = useLedger();

  const spentTransactions = useMemo(
    () => allTransactions.filter((tx) => tx.kind === "expense"),
    [allTransactions],
  );

  const totalSpent = useMemo(
    () => spentTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [spentTransactions],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of spentTransactions) {
      const key = dayLabel(tx.occurred_at);
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.entries()];
  }, [spentTransactions]);

  return (
    <AppShell
      title="All Spent"
      subtitle={`${spentTransactions.length} spending entries`}
      backTo="/"
    >
      <GlassCard className="glow-cool mb-6 px-5 py-5">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="size-4 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Total Spent
          </p>
        </div>
        <p className="numeric mt-2 text-[32px] font-semibold leading-none">
          {formatMoney(totalSpent)}
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
