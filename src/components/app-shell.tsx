import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
<<<<<<< HEAD
import {
  Home,
  Receipt,
  Users,
  PieChart,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Split,
  ArrowLeftRight,
  Settings,
  ArrowLeft,
} from "lucide-react";
=======
import { Home, Receipt, Users, PieChart, Plus, ArrowDownLeft, ArrowUpRight, Split, ArrowLeftRight, Settings } from "lucide-react";
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
import { BottomSheet } from "@/components/bottom-sheet";
import { QuickAddSheet, type QuickAddMode } from "@/components/quick-add";
import { haptics } from "@/lib/haptics";
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
<<<<<<< HEAD
  backTo,
=======
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
<<<<<<< HEAD
  backTo?: string;
=======
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<QuickAddMode | null>(null);
  const [bloom, setBloom] = useState(false);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-5 pb-32 pt-8">
<<<<<<< HEAD
      <header className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backTo ? (
            <Link
              to={backTo}
              className="press glow-edge flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground transition-colors hover:text-foreground active:press-active"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-5" />
            </Link>
          ) : null}
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
=======
      <header className="mb-7 flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
        </div>
        <Link
          to="/settings"
          className="press glow-edge rounded-full border border-border bg-secondary/50 p-2.5 text-muted-foreground active:press-active"
          aria-label="Settings"
        >
          <Settings className="size-[18px]" />
        </Link>
      </header>

      <main className="rise">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-5 pb-5">
        <div className="glass relative flex items-center justify-between rounded-[1.9rem] px-3 py-3">
          {NAV.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} active={pathname === item.to} />
          ))}
          <button
            onClick={() => {
              haptics.select();
              setBloom(true);
              window.setTimeout(() => setBloom(false), 520);
              setMenuOpen(true);
            }}
            aria-label="Add"
            className={cn(
<<<<<<< HEAD
              "press glow-button -mt-8 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-75 active:scale-95 active:press-active",
=======
              "press glow-button -mt-8 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground active:press-active",
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
              bloom && "glow-bloom",
            )}
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
<<<<<<< HEAD
              className="press glow-edge flex flex-col items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-4 text-left transition-transform duration-75 active:scale-95 active:press-active"
=======
              className="press glow-edge flex flex-col items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-4 text-left active:press-active"
>>>>>>> 7d57194f3c1c2fc0c9389ca49cb0ec2db007890c
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
        "press flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors duration-200 active:press-active",
        active ? "glow-active text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-[20px]" />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}
