import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={handleOverlayClick}
    >
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-background/70 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
      />
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-md rounded-t-[2rem] border-t border-border bg-popover px-5 pb-8 pt-3 shadow-glass animate-in slide-in-from-bottom duration-300",
          "max-h-[92vh] overflow-y-auto",
          className,
        )}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted-foreground/30" />
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="press rounded-full border border-border p-2 text-muted-foreground transition-transform duration-75 active:scale-95 active:press-active"
              aria-label="Close sheet"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
