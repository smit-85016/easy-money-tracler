import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  // Desktop-only pointer spotlight: writes CSS vars consumed by .glow-card::after.
  const onPointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div onMouseMove={onPointerMove} className={cn("glow-card rounded-3xl", className)}>
      {children}
    </div>
  );
}


export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        haptics.select();
        onClick?.();
      }}
      className={cn(
        "press glow-edge rounded-full border px-4 py-2 text-sm font-medium transition-transform duration-75 active:scale-95 active:press-active",
        active
          ? "border-primary/60 bg-primary/15 text-foreground"
          : "border-border bg-secondary/50 text-muted-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AmountField({
  value,
  onChange,
  autoFocus,
  placeholder = "0",
}: {
  value: string;
  onChange: (next: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  return (
    <div className="flex items-baseline justify-center gap-1 py-2">
      <span className="text-3xl font-light text-muted-foreground">₹</span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
        className="numeric w-full max-w-[70vw] bg-transparent text-center text-6xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={cn(
        "w-full rounded-2xl border border-input bg-secondary/35 px-4 py-3.5 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/60 focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-ring)_18%,transparent)]",
        className,
      )}
    />
  );
}

export function PrimaryButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "press glow-button w-full rounded-2xl bg-primary px-5 py-4 text-[15px] font-semibold text-primary-foreground shadow-float transition-transform duration-75 active:scale-95 active:press-active disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "press glow-edge rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium text-foreground transition-transform duration-75 active:scale-95 active:press-active disabled:cursor-not-allowed disabled:opacity-40 disabled:pointer-events-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="glow-dashed rounded-3xl border border-dashed border-border px-6 py-10 text-center">
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
