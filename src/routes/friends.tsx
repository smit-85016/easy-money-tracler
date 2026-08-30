import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import {
  EmptyState,
  GhostButton,
  GlassCard,
  SectionLabel,
  TextField,
} from "@/components/primitives";
import { friendTotals, useAddFriend, useFriends, useLedger } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const Route = createFileRoute("/friends")({
  head: () => ({
    meta: [
      { title: "Friends — Tallyo" },
      {
        name: "description",
        content: "Track who owes you, what you owe, and settle up without touching your balance.",
      },
      { property: "og:title", content: "Friends — Tallyo" },
      {
        property: "og:description",
        content: "Track who owes you, what you owe, and settle up in one tap.",
      },
    ],
  }),
  component: FriendsLayout,
});

function FriendsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/friends") return <Outlet />;
  return <FriendsList />;
}

function FriendsList() {
  const { data: friends = [] } = useFriends();
  const { data: ledger = [] } = useLedger();
  const addFriend = useAddFriend();
  const [name, setName] = useState("");

  const totals = friends.map((friend) => ({ friend, ...friendTotals(friend.id, ledger) }));
  const toReceive = totals.reduce((sum, t) => sum + t.toReceive, 0);
  const toPay = totals.reduce((sum, t) => sum + t.toPay, 0);

  return (
    <AppShell title="Friends" subtitle="Split, track, settle">
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            To Receive
          </p>
          <p className="numeric mt-1 text-[20px] font-semibold text-positive">
            {formatMoney(toReceive)}
          </p>
        </GlassCard>
        <GlassCard className="px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            To Pay
          </p>
          <p className="numeric mt-1 text-[20px] font-semibold text-warning">
            {formatMoney(toPay)}
          </p>
        </GlassCard>
      </div>

      <div className="mt-7 flex gap-2">
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a friend"
        />
        <GhostButton
          className="shrink-0 px-4"
          onClick={() => {
            const trimmed = name.trim();
            if (!trimmed) return;
            addFriend.mutate(trimmed, {
              onSuccess: () => {
                setName("");
                toast.success(`${trimmed} added`);
              },
              onError: (error) => toast.error(error.message),
            });
          }}
        >
          <Plus className="size-4" />
        </GhostButton>
      </div>

      <div className="mt-7">
        <SectionLabel>People</SectionLabel>
        {totals.length === 0 ? (
          <EmptyState title="No friends yet" hint="Add someone to start splitting bills." />
        ) : (
          <GlassCard className="divide-y divide-border p-1.5">
            {totals.map(({ friend, toReceive: recv, toPay: pay }) => (
              <Link
                key={friend.id}
                to="/friends/$friendId"
                params={{ friendId: friend.id }}
                className="press flex items-center gap-3 rounded-2xl px-3 py-3.5 active:press-active"
              >
                <span className="flex size-10 items-center justify-center rounded-full border border-border bg-secondary/50 text-sm font-semibold">
                  {friend.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{friend.name}</span>
                  <span className="numeric block text-[13px] text-muted-foreground">
                    {recv === 0 && pay === 0
                      ? "Settled up"
                      : [
                          recv > 0 ? `${formatMoney(recv)} to receive` : null,
                          pay > 0 ? `${formatMoney(pay)} to pay` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </GlassCard>
        )}
      </div>
    </AppShell>
  );
}
