import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, SectionLabel, EmptyState } from "@/components/primitives";
import { TransactionRow } from "@/components/transaction-row";
import { accountBalance, useLedger, useSummary } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tallyo — Your Balance At A Glance" },
      {
        name: "description",
        content:
          "See available balance, spending this month, and pending friend settlements on one calm screen.",
      },
      { property: "og:title", content: "Tallyo — Your Balance At A Glance" },
      {
        property: "og:description",
        content: "Available balance, monthly spend and friend settlements in one calm screen.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const summary = useSummary();
  const { data: ledger = [] } = useLedger();
  const recent = summary.transactions.slice(0, 6);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <AppShell title="Tallyo" subtitle={greeting}>
      <GlassCard className="px-6 py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Available Balance
        </p>
        <p className="glow-halo numeric mt-2 text-[44px] font-semibold leading-none">
          {formatMoney(summary.available)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {summary.accounts.map((account) => (
            <span
              key={account.id}
              className="glow-edge rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[12px] text-muted-foreground"
            >
              {account.name}{" "}
              <span className="numeric text-foreground">
                {formatMoney(accountBalance(account, summary.transactions))}
              </span>
            </span>
          ))}
        </div>
      </GlassCard>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatCard label="Spent" value={summary.spentThisMonth} tone="neutral" icon={ArrowUpRight} />
        <StatCard label="To Receive" value={summary.toReceive} tone="positive" icon={ArrowDownLeft} />
        <StatCard label="To Pay" value={summary.toPay} tone="warning" icon={Wallet} />
      </div>

      <div className="mt-8">
        <SectionLabel
          action={
            <Link to="/transactions" className="text-[13px] font-medium text-primary">
              See all
            </Link>
          }
        >
          Recent
        </SectionLabel>
        {recent.length === 0 ? (
          <EmptyState title="Nothing logged yet" hint="Tap + to record your first entry." />
        ) : (
          <GlassCard className="divide-y divide-border p-1.5">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} ledger={ledger} />
            ))}
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "neutral" | "positive" | "warning";
  icon: typeof Wallet;
}) {
  const color =
    tone === "positive"
      ? "var(--color-positive)"
      : tone === "warning"
        ? "var(--color-warning)"
        : "var(--color-muted-foreground)";
  const tint =
    tone === "positive" ? "glow-emerald" : tone === "warning" ? "glow-amber" : "glow-cool";
  return (
    <GlassCard className={`${tint} px-3.5 py-4`}>
      <Icon className="size-4" style={{ color }} />
      <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="numeric mt-1 text-[17px] font-semibold">{formatMoney(value)}</p>
    </GlassCard>
  );
}
