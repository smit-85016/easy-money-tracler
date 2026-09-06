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
<<<<<<< HEAD
      { title: "Activity — Worth" },
=======
      { title: "Activity — Tallyo" },
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
      {
        name: "description",
        content: "A clean timeline of everything you spent, received and transferred.",
      },
<<<<<<< HEAD
      { property: "og:title", content: "Activity — Worth" },
=======
      { property: "og:title", content: "Activity — Tallyo" },
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
<<<<<<< HEAD
        <EmptyState title="No transactions yet. Tap + to add one." />
=======
        <EmptyState title="No transactions yet" hint="Everything you log shows up here." />
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
  const [note, setNote] = useState("");
  const [loadedId, setLoadedId] = useState<string | null>(null);

  if (tx && loadedId !== tx.id) {
    setLoadedId(tx.id);
    setAmount(String(tx.amount / 100));
    setNote(tx.note ?? tx.description ?? tx.source ?? "");
  }

<<<<<<< HEAD
  if (!tx)
    return (
      <BottomSheet open={false} onClose={onClose}>
        {null}
      </BottomSheet>
    );
=======
  if (!tx) return <BottomSheet open={false} onClose={onClose}>{null}</BottomSheet>;
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c

  const meta = transactionMeta(tx);

  return (
    <BottomSheet open onClose={onClose} title={`Edit · ${meta.label}`}>
<<<<<<< HEAD
      <AmountField value={amount} onChange={setAmount} autoFocus />
=======
      <AmountField value={amount} onChange={setAmount} />
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
      <div className="space-y-4">
        <FieldRow label="Note">
          <TextField
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
          />
        </FieldRow>
        <PrimaryButton
<<<<<<< HEAD
          disabled={save.isPending || toPaise(amount) <= 0}
          onClick={() => {
            const paise = toPaise(amount);
            if (paise <= 0) {
              toast.error("Enter an amount");
              return;
            }
=======
          onClick={() => {
            const paise = toPaise(amount);
            if (paise <= 0) { toast.error("Enter an amount"); return; }
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
            const text = note.trim() || null;
            save.mutate(
              {
                id: tx.id,
                kind: tx.kind as "expense" | "income" | "transfer",
                amount: paise,
                category: tx.category,
                account_id: tx.account_id,
                to_account_id: tx.to_account_id,
                occurred_at: tx.occurred_at,
                note: text,
                ...(tx.kind === "income"
                  ? { source: text ?? tx.source ?? null }
                  : { description: text }),
              },

              {
                onSuccess: () => {
                  haptics.confirm();
<<<<<<< HEAD
                  toast.success("Transaction saved");
=======
                  toast.success(`Updated to ${formatMoney(paise)}`);
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
<<<<<<< HEAD
                toast.success("Transaction deleted");
=======
                toast.success("Deleted");
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
