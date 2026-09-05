import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Moon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  Chip,
  GhostButton,
  GlassCard,
  SectionLabel,
  TextField,
} from "@/components/primitives";
import { Switch } from "@/components/ui/switch";
import {
  accountBalance,
  useAccounts,
  useAddAccount,
  useResetAllData,
  useTransactions,
  useUpdateAccount,
} from "@/lib/data";
import { formatMoney, toPaise } from "@/lib/money";
import { useTheme } from "@/lib/theme";

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
  const updateAccount = useUpdateAccount();
  const resetData = useResetAllData();
  const { isDark, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("bank");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftAmount, setDraftAmount] = useState("");

  const submitAccount = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addAccount.mutateAsync({ name: trimmed, kind });
    setName("");
    toast.success(`${trimmed} added`);
  };

  const startEdit = (accountId: string, accountName: string, balance: number) => {
    setEditingId(accountId);
    setDraftName(accountName);
    setDraftAmount((balance / 100).toFixed(2));
  };

  const saveEdit = async (accountId: string) => {
    await updateAccount.mutateAsync({
      id: accountId,
      name: draftName,
      balance: toPaise(draftAmount),
    });
    setEditingId(null);
    toast.success("Account updated");
  };

  return (
    <AppShell title="Settings" subtitle="Saved on this device">
      <SectionLabel>Appearance</SectionLabel>
      <GlassCard className="mb-6 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Moon className="size-4 shrink-0 text-muted-foreground" />
            <p className="truncate text-[15px] font-medium">Dark Mode</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`press glow-edge relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 ${
              isDark ? "border-primary/60 bg-primary/70" : "border-border bg-secondary"
            }`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-background shadow-float transition-[left] duration-200 ${
                isDark ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </GlassCard>


      <SectionLabel>Accounts</SectionLabel>
      <GlassCard className="divide-y divide-border p-2">
        {accounts.map((account) => {
          const balance = accountBalance(account, transactions);
          const editing = editingId === account.id;
          return (
            <div key={account.id} className="flex items-center gap-3 px-2 py-3">
              {editing ? (
                <>
                  <TextField
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="min-w-0 flex-1 px-3 py-2 text-sm"
                    placeholder="Account name"
                  />
                  <TextField
                    inputMode="decimal"
                    value={draftAmount}
                    onChange={(e) => setDraftAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    className="numeric w-24 shrink-0 px-3 py-2 text-right text-sm"
                    placeholder="0"
                  />
                  <GhostButton
                    className="shrink-0 px-3 py-2"
                    aria-label="Save account"
                    onClick={() => void saveEdit(account.id)}
                  >
                    <Check className="size-4" />
                  </GhostButton>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{account.name}</p>
                    <p className="text-[12px] capitalize text-muted-foreground">{account.kind}</p>
                  </div>
                  <p className="numeric shrink-0 text-[15px] font-semibold">
                    {formatMoney(balance)}
                  </p>
                  <GhostButton
                    className="shrink-0 px-3 py-2"
                    aria-label={`Edit ${account.name}`}
                    onClick={() => startEdit(account.id, account.name, balance)}
                  >
                    <Pencil className="size-4" />
                  </GhostButton>
                </>
              )}
            </div>
          );
        })}
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
