import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BellRing, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { BottomSheet } from "@/components/bottom-sheet";
import {
  Chip,
  EmptyState,
  FieldRow,
  GhostButton,
  GlassCard,
  PrimaryButton,
  SectionLabel,
  TextField,
} from "@/components/primitives";
import { formatMoney, toPaise } from "@/lib/money";
import { haptics } from "@/lib/haptics";
import {
  friendTotals,
  useDeleteLedgerEntry,
  useFriends,
  useLedger,
  useSaveLedgerEntry,
  useUpdateLedgerEntry,
  type LedgerEntry,
} from "@/lib/data";
import { REMINDER_PRESETS, inDays, notificationPermission, requestNotifications } from "@/lib/reminders";

export const Route = createFileRoute("/friends/$friendId")({
  head: () => ({
    meta: [
      { title: "Friend Ledger — Paise" },
      {
        name: "description",
        content: "Payment history with one friend, with reminders and one-tap settle.",
      },
      { property: "og:title", content: "Friend Ledger — Paise" },
      {
        property: "og:description",
        content: "Payment history with one friend, with reminders and one-tap settle.",
      },
    ],
  }),
  component: FriendDetail,
});

function FriendDetail() {
  const { friendId } = Route.useParams();
  const { data: friends = [] } = useFriends();
  const { data: ledger = [] } = useLedger();
  const saveEntry = useSaveLedgerEntry();
  const updateEntry = useUpdateLedgerEntry();
  const deleteEntry = useDeleteLedgerEntry();

  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [direction, setDirection] = useState<"to_receive" | "to_pay">("to_receive");
  const [reminderFor, setReminderFor] = useState<LedgerEntry | null>(null);

  const friend = friends.find((f) => f.id === friendId);
  const entries = ledger.filter((e) => e.friend_id === friendId);
  const totals = friendTotals(friendId, ledger);

  return (
    <AppShell title={friend?.name ?? "Friend"} subtitle="Payment history">
      <Link
        to="/friends"
        className="press mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground active:press-active"
      >
        <ArrowLeft className="size-4" /> All friends
      </Link>

      <GlassCard className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Net position
        </p>
        <p
          className="numeric mt-1.5 text-[32px] font-semibold"
          style={{
            color: totals.net >= 0 ? "var(--color-positive)" : "var(--color-warning)",
          }}
        >
          {formatMoney(Math.abs(totals.net))}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {totals.net === 0
            ? "All settled"
            : totals.net > 0
              ? "They owe you"
              : "You owe them"}
        </p>
      </GlassCard>

      <div className="mt-6 space-y-3">
        <div className="flex gap-2">
          <Chip active={direction === "to_receive"} onClick={() => setDirection("to_receive")}>
            They owe me
          </Chip>
          <Chip active={direction === "to_pay"} onClick={() => setDirection("to_pay")}>
            I owe them
          </Chip>
        </div>
        <div className="flex gap-2">
          <TextField
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            placeholder="Amount"
            className="w-32 shrink-0"
          />
          <TextField value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What for" />
        </div>
        <GhostButton
          className="w-full"
          onClick={() => {
            const paise = toPaise(amount);
            if (paise <= 0) return toast.error("Enter an amount");
            saveEntry.mutate(
              { friend_id: friendId, direction, amount: paise, label: label.trim() || null },
              {
                onSuccess: () => {
                  haptics.confirm();
                  setAmount("");
                  setLabel("");
                  toast.success("Entry added");
                },
                onError: (error) => toast.error(error.message),
              },
            );
          }}
        >
          Add Entry
        </GhostButton>
      </div>

      <div className="mt-8">
        <SectionLabel>History</SectionLabel>
        {entries.length === 0 ? (
          <EmptyState title="Nothing between you two yet" />
        ) : (
          <GlassCard className="divide-y divide-border p-2">
            {entries.map((entry) => (
              <div key={entry.id} className="px-2 py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{entry.label || "Entry"}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {new Date(entry.occurred_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                      {entry.settled_at ? " · settled" : ""}
                      {!entry.settled_at && entry.remind_at
                        ? ` · reminder ${new Date(entry.remind_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                        : ""}
                    </p>
                  </div>
                  <p
                    className="numeric shrink-0 text-[15px] font-semibold"
                    style={{
                      color: entry.settled_at
                        ? "var(--color-muted-foreground)"
                        : entry.direction === "to_receive"
                          ? "var(--color-positive)"
                          : "var(--color-warning)",
                    }}
                  >
                    {formatMoney(entry.amount)}
                  </p>
                </div>
                <div className="mt-2.5 flex gap-2">
                  {!entry.settled_at ? (
                    <>
                      <GhostButton
                        className="flex items-center gap-1.5 px-3 py-2 text-[13px]"
                        onClick={() =>
                          updateEntry.mutate(
                            { id: entry.id, settled_at: new Date().toISOString() },
                            {
                              onSuccess: () => {
                                haptics.confirm();
                                toast.success("Settled");
                              },
                            },
                          )
                        }
                      >
                        <Check className="size-3.5" /> Settle
                      </GhostButton>
                      <GhostButton
                        className="flex items-center gap-1.5 px-3 py-2 text-[13px]"
                        onClick={() => setReminderFor(entry)}
                      >
                        <BellRing className="size-3.5" /> Remind
                      </GhostButton>
                    </>
                  ) : (
                    <GhostButton
                      className="px-3 py-2 text-[13px]"
                      onClick={() => updateEntry.mutate({ id: entry.id, settled_at: null })}
                    >
                      Reopen
                    </GhostButton>
                  )}
                  <GhostButton
                    className="px-3 py-2 text-[13px] text-destructive"
                    onClick={() =>
                      deleteEntry.mutate(entry.id, {
                        onSuccess: () => {
                          haptics.warn();
                          toast.success("Removed");
                        },
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </GhostButton>
                </div>
              </div>
            ))}
          </GlassCard>
        )}
      </div>

      <ReminderSheet entry={reminderFor} onClose={() => setReminderFor(null)} />
    </AppShell>
  );
}

function ReminderSheet({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  const updateEntry = useUpdateLedgerEntry();
  const [customDate, setCustomDate] = useState("");

  const apply = async (iso: string) => {
    if (notificationPermission() === "default") await requestNotifications();
    if (!entry) return;
    updateEntry.mutate(
      { id: entry.id, remind_at: iso },
      {
        onSuccess: () => {
          haptics.confirm();
          toast.success(
            `Reminder set for ${new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
          );
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <BottomSheet open={!!entry} onClose={onClose} title="Remind me">
      <div className="space-y-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {REMINDER_PRESETS.map((preset) => (
            <Chip key={preset.id} onClick={() => void apply(inDays(preset.days))}>
              {preset.label}
            </Chip>
          ))}
        </div>
        <FieldRow label="Custom date">
          <TextField
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        </FieldRow>
        <PrimaryButton
          disabled={!customDate}
          onClick={() => void apply(new Date(`${customDate}T10:00:00`).toISOString())}
        >
          Set Reminder
        </PrimaryButton>
        {notificationPermission() === "denied" ? (
          <p className="text-[12px] text-muted-foreground">
            Notifications are blocked in your browser, so reminders will show inside the app only.
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
