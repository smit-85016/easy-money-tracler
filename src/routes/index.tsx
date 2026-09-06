import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownLeft, Wallet, Eye, EyeOff } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { GlassCard, SectionLabel, EmptyState } from "@/components/primitives";
import { TransactionRow } from "@/components/transaction-row";
import { useLedger, useSummary } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { haptics } from "@/lib/haptics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Worth — Your Balance At A Glance" },
      {
        name: "description",
        content:
          "See available balance, spending this month, and pending friend settlements on one calm screen.",
      },
      { property: "og:title", content: "Worth — Your Balance At A Glance" },
      {
        property: "og:description",
        content: "Available balance, monthly spend and friend settlements in one calm screen.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [isMasked, setIsMasked] = useState(true);
  const summary = useSummary();
  const { data: ledger = [] } = useLedger();
  const recent = summary.transactions.slice(0, 3);

  return (
    <AppShell title="Worth" subtitle="Money, made clear.">
      <GlassCard className="px-6 py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Available Balance
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="glow-halo numeric text-[44px] font-semibold leading-none">
            {isMasked ? "₹ •••••" : formatMoney(summary.available)}
          </p>
          <button
            type="button"
            onClick={() => {
              haptics.select();
              setIsMasked((prev) => !prev);
            }}
            className="press glow-edge flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/40 text-muted-foreground transition-all duration-75 hover:text-foreground active:scale-95 active:press-active focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label={isMasked ? "Show balance" : "Hide balance"}
            title={isMasked ? "Show balance" : "Hide balance"}
          >
            {isMasked ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        </div>
      </GlassCard>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatCard
          to="/spent-transactions"
          label="Spent"
          value={summary.spentThisMonth}
          tone="neutral"
          icon={ArrowUpRight}
        />
        <StatCard
          to="/received-transactions"
          label="To Receive"
          value={summary.toReceive}
          tone="positive"
          icon={ArrowDownLeft}
        />
        <StatCard
          to="/to-pay-transactions"
          label="To Pay"
          value={summary.toPay}
          tone="warning"
          icon={Wallet}
        />
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
          <EmptyState title="No transactions yet. Tap + to add one." />
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
  to,
  label,
  value,
  tone,
  icon: Icon,
}: {
  to: string;
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
    <Link to={to} className="press block focus:outline-none transition-transform duration-75 active:scale-95 active:press-active">
      <GlassCard className={`${tint} px-3.5 py-4 transition-colors hover:border-primary/40`}>
        <Icon className="size-4" style={{ color }} />
        <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        <p className="numeric mt-1 text-[17px] font-semibold">{formatMoney(value)}</p>
      </GlassCard>
    </Link>
  );
}
