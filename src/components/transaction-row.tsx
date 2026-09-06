import { categoryOf, INCOME_META, TRANSFER_META } from "@/lib/categories";
import { formatMoney } from "@/lib/money";
import type { LedgerEntry, Transaction } from "@/lib/data";
import { cn } from "@/lib/utils";

export function transactionMeta(tx: Transaction) {
  if (tx.kind === "income") return INCOME_META;
  if (tx.kind === "transfer") return TRANSFER_META;
  const category = categoryOf(tx.category);
  return { label: category.label, icon: category.icon, tint: category.tint };
}

export function TransactionRow({
  tx,
  ledger = [],
  onClick,
}: {
  tx: Transaction;
  ledger?: LedgerEntry[];
  onClick?: () => void;
}) {
  const meta = transactionMeta(tx);
  const Icon = meta.icon;
  const recoverable = ledger
    .filter((e) => e.transaction_id === tx.id && !e.settled_at)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className="press flex w-full items-center gap-3.5 rounded-2xl px-2 py-2.5 text-left transition-transform duration-75 active:scale-95 active:press-active"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border"
        style={{ backgroundColor: `color-mix(in oklab, ${meta.tint} 16%, transparent)` }}
      >
        <Icon className="size-5" style={{ color: meta.tint }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-foreground">{meta.label}</span>
        <span className="block truncate text-[13px] text-muted-foreground">
          {tx.description || tx.source || tx.note || "—"}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={cn(
            "numeric block text-[15px] font-semibold",
            tx.kind === "income" ? "text-positive" : "text-foreground",
          )}
        >
          {tx.kind === "income"
            ? formatMoney(tx.amount, { sign: true })
            : tx.kind === "transfer"
              ? formatMoney(tx.amount)
              : formatMoney(-tx.amount)}
        </span>
        {recoverable > 0 ? (
          <span className="numeric block text-[12px] text-warning">
            {formatMoney(recoverable)} recoverable
          </span>
        ) : null}
      </span>
    </button>
  );
}
