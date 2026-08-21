import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Receipt, Users, PieChart, Plus, ArrowDownLeft, ArrowUpRight, Split, ArrowLeftRight, Settings } from "lucide-react";
import { BottomSheet } from "@/components/bottom-sheet";
import { QuickAddSheet, type QuickAddMode } from "@/components/quick-add";
import { useAuth } from "@/lib/auth";
import { haptics } from "@/lib/haptics";
import { useFriends, useLedger } from "@/lib/data";
import { useReminderWatcher } from "@/lib/reminders";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/transactions", label: "Activity", icon: Receipt },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/insights", label: "Insights", icon: PieChart },
] as const;

const ADD_ACTIONS: { mode: QuickAddMode; label: string; icon: typeof Plus; tint: string }[] = [
  { mode: "expense", label: "Add Expense", icon: ArrowUpRight, tint: "var(--color-destructive)" },
  { mode: "income", label: "Add Money", icon: ArrowDownLeft, tint: "var(--color-positive)" },
  { mode: "split", label: "Split Bill", icon: Split, tint: "var(--color-chart-3)" },
  { mode: "transfer", label: "Transfer", icon: ArrowLeftRight, tint: "var(--color-chart-5)" },
];

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { loading, user } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<QuickAddMode | null>(null);
  const { data: ledger = [] } = useLedger();
  const { data: friends = [] } = useFriends();
  useReminderWatcher(ledger, friends);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!user) return <SignInGate />;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-32 pt-8">
      <header className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <Link
          to="/settings"
          className="press rounded-full border border-border bg-secondary/50 p-2.5 text-muted-foreground active:press-active"
          aria-label="Settings"
        >
          <Settings className="size-[18px]" />
        </Link>
      </header>

      <main className="rise">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-5 pb-5">
        <div className="glass relative flex items-center justify-between rounded-[1.75rem] px-3 py-2.5">
          {NAV.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
          <button
            onClick={() => {
              haptics.select();
              setMenuOpen(true);
            }}
            aria-label="Add"
            className="press -mt-8 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float active:press-active"
          >
            <Plus className="size-6" />
          </button>
          {NAV.slice(2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname.startsWith(item.to)} />
          ))}
        </div>
      </nav>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Quick Add">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {ADD_ACTIONS.map((action) => (
            <button
              key={action.mode}
              onClick={() => {
                haptics.select();
                setMenuOpen(false);
                setMode(action.mode);
              }}
              className="press flex flex-col items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-4 text-left active:press-active"
            >
              <span
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `color-mix(in oklab, ${action.tint} 18%, transparent)` }}
              >
                <action.icon className="size-5" style={{ color: action.tint }} />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      <QuickAddSheet mode={mode} onClose={() => setMode(null)} />
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      onClick={() => haptics.select()}
      className={cn(
        "press flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 active:press-active",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-[20px]" />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}

function SignInGate() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Paise</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your private money notebook. Sign in to sync across your devices.
      </p>
      <Link
        to="/auth"
        className="press mt-8 w-full rounded-2xl bg-primary px-5 py-4 text-[15px] font-semibold text-primary-foreground shadow-float active:press-active"
      >
        Continue
      </Link>
    </div>
  );
}
