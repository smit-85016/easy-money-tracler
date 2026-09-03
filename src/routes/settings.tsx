import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  Chip,
  GhostButton,
  GlassCard,
  SectionLabel,
  TextField,
} from "@/components/primitives";
import {
  accountBalance,
  useAccounts,
  useAddAccount,
  useResetAllData,
  useTransactions,
} from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Tallyo" },
      {
        name: "description",
        content: "Manage your accounts in Tallyo. Everything stays on your device.",
      },
      { property: "og:title", content: "Settings — Tallyo" },
      {
        property: "og:description",
        content: "Manage your accounts in Tallyo. Everything stays on your device.",
      },
    ],
  }),
  component: SettingsPage,
});

const KINDS = [
  { id: "bank", label: "Bank" },
  { id: "cash", label: "Cash" },
  { id: "wallet", label: "Wallet" },
] as const;

function SettingsPage() {
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const addAccount = useAddAccount();
  const resetData = useResetAllData();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("bank");

  const submitAccount = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addAccount.mutateAsync({ name: trimmed, kind });
    setName("");
    toast.success(`${trimmed} added`);
  };

  return (
    <AppShell title="Settings" subtitle="Saved on this device">
      <SectionLabel>Accounts</SectionLabel>
      <GlassCard className="divide-y divide-border p-2">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center justify-between px-2 py-3">
            <div>
              <p className="text-[15px] font-medium">{account.name}</p>
              <p className="text-[12px] capitalize text-muted-foreground">{account.kind}</p>
            </div>
            <p className="numeric text-[15px] font-semibold">
              {formatMoney(accountBalance(account, transactions))}
            </p>
          </div>
        ))}
      </GlassCard>

      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          {KINDS.map((item) => (
            <Chip key={item.id} active={kind === item.id} onClick={() => setKind(item.id)}>
              {item.label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New account name"
          />
          <GhostButton className="shrink-0 px-4" onClick={() => void submitAccount()}>
            <Plus className="size-4" />
          </GhostButton>
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Data</SectionLabel>
        <GlassCard className="px-5 py-4">
          <p className="text-[13px] text-muted-foreground">
            All your money data lives only on this device — no account, no sync.
          </p>
          <GhostButton
            className="mt-3 flex items-center gap-2 text-destructive"
            onClick={async () => {
              if (!window.confirm("Clear all transactions, friends and dues?")) return;
              await resetData.mutateAsync();
              toast.success("All data cleared");
            }}
          >
            <Trash2 className="size-4" /> Clear All Data
          </GhostButton>
        </GlassCard>
      </div>
    </AppShell>
  );
}
