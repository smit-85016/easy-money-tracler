import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { EmptyState, GlassCard, SectionLabel } from "@/components/primitives";
import { categoryOf } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import { useSummary } from "@/lib/data";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
<<<<<<< HEAD
      { title: "Insights — Worth" },
=======
      { title: "Insights — Tallyo" },
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
      {
        name: "description",
        content: "A one-glance monthly summary: received, spent, remaining and your top category.",
      },
<<<<<<< HEAD
      { property: "og:title", content: "Insights — Worth" },
=======
      { property: "og:title", content: "Insights — Tallyo" },
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
      {
        property: "og:description",
        content: "Received, spent, remaining and your top spending category this month.",
      },
    ],
  }),
  component: InsightsPage,
});

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function InsightsPage() {
  const summary = useSummary();
  const month = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const top = summary.categoryTotals[0];

  const chartData = summary.categoryTotals.slice(0, 5).map((item, index) => ({
    name: categoryOf(item.id).label,
    value: item.amount / 100,
    fill: PALETTE[index % PALETTE.length],
  }));

<<<<<<< HEAD
  const hasSpending = summary.spentThisMonth > 0 && chartData.some((d) => d.value > 0);

=======
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
  return (
    <AppShell title="Insights" subtitle={month}>
      <div className="space-y-3">
        <GlassCard className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted-foreground">Total Received</span>
          <span className="numeric text-[17px] font-semibold text-positive">
            {formatMoney(summary.receivedThisMonth)}
          </span>
        </GlassCard>
        <GlassCard className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted-foreground">Total Spent</span>
          <span className="numeric text-[17px] font-semibold">
            {formatMoney(summary.spentThisMonth)}
          </span>
        </GlassCard>
        <GlassCard className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted-foreground">Remaining Balance</span>
<<<<<<< HEAD
          <span className="numeric text-[17px] font-semibold">
            {formatMoney(summary.available)}
          </span>
=======
          <span className="numeric text-[17px] font-semibold">{formatMoney(summary.available)}</span>
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
        </GlassCard>
        <GlassCard className="flex items-center justify-between px-5 py-4">
          <span className="text-sm text-muted-foreground">Top Category</span>
          <span className="text-[15px] font-semibold">
            {top ? `${categoryOf(top.id).label} · ${formatMoney(top.amount)}` : "—"}
          </span>
        </GlassCard>
      </div>

      <div className="mt-8">
        <SectionLabel>Where it went</SectionLabel>
<<<<<<< HEAD
        {!hasSpending ? (
          <EmptyState
            title="No transactions yet. Tap + to add one."
            hint="Your chart appears once you log expenses."
          />
=======
        {chartData.length === 0 ? (
          <EmptyState title="No spending this month" hint="Your chart appears once you log expenses." />
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
        ) : (
          <GlassCard className="px-3 py-5">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]} maxBarSize={34}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        )}
      </div>

      <GlassCard className="mt-4 px-5 py-4">
        <p className="text-[13px] text-muted-foreground">
          Pending settlements are kept out of your balance: {formatMoney(summary.toReceive)} to
          receive, {formatMoney(summary.toPay)} to pay.
        </p>
      </GlassCard>
    </AppShell>
  );
}
