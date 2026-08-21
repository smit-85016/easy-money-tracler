export function tap(pattern: number | number[] = 12) {
  if (typeof navigator === "undefined") return;
  const vibrate = (navigator as Navigator & { vibrate?: (p: number | number[]) => boolean })
    .vibrate;
  try {
    vibrate?.call(navigator, pattern);
  } catch {
    /* haptics unavailable */
  }
}

export const haptics = {
  select: () => tap(8),
  confirm: () => tap([14, 30, 18]),
  warn: () => tap([24, 40, 24]),
};
