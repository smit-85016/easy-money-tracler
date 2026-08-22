import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { BottomSheet } from "@/components/bottom-sheet";
import {
  AmountField,
  EmptyState,
  FieldRow,
  GhostButton,
  GlassCard,
  PrimaryButton,
  SectionLabel,
  TextField,
} from "@/components/primitives";
import { TransactionRow, transactionMeta } from "@/components/transaction-row";
import { formatMoney, toPaise } from "@/lib/money";
import { haptics } from "@/lib/haptics";
import {
  useDeleteTransaction,
  useLedger,
  useSaveTransaction,
  useTransactions,
  type Transaction,
} from "@/lib/data";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Activity — Paise" },
      {
        name: "description",
        content: "A clean timeline of everything you spent, received and transferred.",
      },
      { property: "og:title", content: "Activity — Paise" },
      {
        property: "og:description",
        content: "A clean timeline of everything you spent, received and transferred.",
      },
    ],
  }),
  component: TransactionsPage,
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

function TransactionsPage() {
  const { data: transactions = [] } = useTransactions();
  const { data: ledger = [] } = useLedger();
  const [editing, setEditing] = useState<Transaction | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const key = dayLabel(tx.occurred_at);
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return [...map.entries()];
  }, [transactions]);

  return (
    <AppShell title="Activity" subtitle={`${transactions.length} entries`}>
      {groups.length === 0 ? (
        <EmptyState title="No transactions yet" hint="Everything you log shows up here." />
      ) : (
        <div className="space-y-7">
          {groups.map(([label, items]) => (
            <section key={label}>
              <SectionLabel>{label}</SectionLabel>
              <GlassCard className="divide-y divide-border p-1.5">
                {items.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    ledger={ledger}
                    onClick={() => setEditing(tx)}
                  />
                ))}
              </GlassCard>
            </section>
          ))}
        </div>
      )}

      <EditSheet tx={editing} onClose={() => setEditing(null)} />
    </AppShell>
  );
}

function EditSheet({ tx, onClose }: { tx: Transaction | null; onClose: () => void }) {
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (tx && loadedId !== tx.id) {
    setLoadedId(tx.id);
    setAmount(String(tx.amount / 100));
    setDescription(tx.description ?? tx.source ?? "");
    setNote(tx.note ?? "");
  }

  if (!tx) return <BottomSheet open={false} onClose={onClose}>{null}</BottomSheet>;

  const meta = transactionMeta(tx);

  return (
    <BottomSheet open onClose={onClose} title={`Edit · ${meta.label}`}>
      <AmountField value={amount} onChange={setAmount} />
      <div className="space-y-4">
        <FieldRow label={tx.kind === "income" ? "Source" : "Description"}>
          <TextField value={description} onChange={(e) => setDescription(e.target.value)} />
        </FieldRow>
        <FieldRow label="Note">
          <TextField value={note} onChange={(e) => setNote(e.target.value)} />
        </FieldRow>
        <PrimaryButton
          onClick={() => {
            const paise = toPaise(amount);
            if (paise <= 0) { toast.error("Enter an amount"); return; }
            save.mutate(
              {
                id: tx.id,
                kind: tx.kind as "expense" | "income" | "transfer",
                amount: paise,
                category: tx.category,
                account_id: tx.account_id,
                to_account_id: tx.to_account_id,
                occurred_at: tx.occurred_at,
                note: note.trim() || null,
                ...(tx.kind === "income"
                  ? { source: description.trim() || null }
                  : { description: description.trim() || null }),
              },
              {
                onSuccess: () => {
                  haptics.confirm();
                  toast.success(`Updated to ${formatMoney(paise)}`);
                  onClose();
                },
                onError: (error) => toast.error(error.message),
              },
            );
          }}
        >
          Save Changes
        </PrimaryButton>
        <GhostButton
          className="flex w-full items-center justify-center gap-2 text-destructive"
          onClick={() => {
            remove.mutate(tx.id, {
              onSuccess: () => {
                haptics.warn();
                toast.success("Deleted");
                onClose();
              },
              onError: (error) => toast.error(error.message),
            });
          }}
        >
          <Trash2 className="size-4" /> Delete
        </GhostButton>
      </div>
    </BottomSheet>
  );
}
