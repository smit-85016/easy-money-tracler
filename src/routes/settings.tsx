import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BellRing, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  Chip,
  GhostButton,
  GlassCard,
  SectionLabel,
  TextField,
} from "@/components/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { accountBalance, useAccounts, useTransactions } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { notificationPermission, requestNotifications } from "@/lib/reminders";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Paise" },
      {
        name: "description",
        content: "Manage your accounts, reminders and session in Paise.",
      },
      { property: "og:title", content: "Settings — Paise" },
      {
        property: "og:description",
        content: "Manage your accounts, reminders and session in Paise.",
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("bank");
  const [permission, setPermission] = useState(notificationPermission());

  const addAccount = async () => {
    const trimmed = name.trim();
    if (!trimmed || !user) return;
    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      name: trimmed,
      kind,
      sort_order: accounts.length,
    });
    if (error) { toast.error(error.message); return; }
    setName("");
    toast.success(`${trimmed} added`);
  };

  return (
    <AppShell title="Settings" subtitle={user?.email ?? undefined}>
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
          <GhostButton className="shrink-0 px-4" onClick={() => void addAccount()}>
            <Plus className="size-4" />
          </GhostButton>
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Reminders</SectionLabel>
        <GlassCard className="px-5 py-4">
          <p className="text-[13px] text-muted-foreground">
            {permission === "granted"
              ? "Notifications are on. You'll be nudged when a payment is due."
              : permission === "denied"
                ? "Notifications are blocked in your browser. Reminders still show inside the app."
                : "Allow notifications to get nudged when a payment is due."}
          </p>
          {permission !== "granted" && permission !== "denied" ? (
            <GhostButton
              className="mt-3 flex items-center gap-2"
              onClick={async () => {
                await requestNotifications();
                setPermission(notificationPermission());
              }}
            >
              <BellRing className="size-4" /> Enable Reminders
            </GhostButton>
          ) : null}
        </GlassCard>
      </div>

      <div className="mt-8">
        <SectionLabel>Session</SectionLabel>
        <GhostButton
          className="flex w-full items-center justify-center gap-2 text-destructive"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth" });
          }}
        >
          <LogOut className="size-4" /> Sign Out
        </GhostButton>
      </div>
    </AppShell>
  );
}
