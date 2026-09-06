/**
 * All money is stored and computed as integer paise (1 rupee = 100 paise).
 * Never use floats for money math.
 */

export function toPaise(input: string | number): number {
  const raw = String(input).replace(/[^\d.]/g, "").trim();
  if (!raw) return 0;
  const [whole, frac = ""] = raw.split(".");
  const rupees = Number.parseInt(whole || "0", 10) || 0;
  const paise = Number.parseInt((frac + "00").slice(0, 2), 10) || 0;
  return rupees * 100 + paise;
}

export function formatMoney(paise: number, opts: { sign?: boolean; compact?: boolean } = {}) {
  const negative = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const rest = abs % 100;
  const body =
    rest === 0
      ? rupees.toLocaleString("en-IN")
      : (abs / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = negative ? "−₹" : opts.sign ? "+₹" : "₹";
  return `${prefix}${body}`;
}

export function splitEvenly(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
}
