import { useEffect } from "react";
import { formatMoney } from "@/lib/money";
import type { Friend, LedgerEntry } from "@/lib/data";

const FIRED_KEY = "paise.reminders.fired";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotifications() {
  if (!notificationsSupported()) return "unsupported" as const;
  return Notification.requestPermission();
}

function firedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function markFired(id: string) {
  const next = [...new Set([...firedIds(), id])].slice(-200);
  localStorage.setItem(FIRED_KEY, JSON.stringify(next));
}

export const REMINDER_PRESETS = [
  { id: "tomorrow", label: "Tomorrow", days: 1 },
  { id: "3days", label: "In 3 days", days: 3 },
  { id: "7days", label: "In 7 days", days: 7 },
] as const;

export function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

/** Fires local notifications for reminders that have come due while the app is open. */
export function useReminderWatcher(entries: LedgerEntry[], friends: Friend[]) {
  useEffect(() => {
    if (!notificationsSupported() || Notification.permission !== "granted") return;

    const names = new Map(friends.map((f) => [f.id, f.name]));

    const check = () => {
      const now = Date.now();
      for (const entry of entries) {
        if (!entry.remind_at || entry.settled_at) continue;
        if (new Date(entry.remind_at).getTime() > now) continue;
        if (firedIds().includes(entry.id)) continue;
        const who = names.get(entry.friend_id) ?? "Friend";
        const verb = entry.direction === "to_receive" ? "owes you" : "is owed";
        new Notification("Pending settlement", {
          body: `${who} ${verb} ${formatMoney(entry.amount)}`,
          tag: entry.id,
        });
        markFired(entry.id);
      }
    };

    check();
    const timer = window.setInterval(check, 60_000);
    return () => window.clearInterval(timer);
  }, [entries, friends]);
}
