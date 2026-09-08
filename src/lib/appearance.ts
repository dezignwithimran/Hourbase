import type { Appearance } from "@/lib/types";

export const APPEARANCE_ORDER: Appearance[] = ["light", "dark", "system"];

export function prefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function isDarkAppearance(appearance: Appearance | undefined): boolean {
  const mode = appearance ?? "system";
  return mode === "dark" || (mode === "system" && prefersDark());
}

export function cycleAppearance(current: Appearance | undefined): Appearance {
  const i = APPEARANCE_ORDER.indexOf(current ?? "system");
  return APPEARANCE_ORDER[(i + 1) % APPEARANCE_ORDER.length];
}

export function applyAppearance(appearance: Appearance | undefined) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDarkAppearance(appearance));
}

export function nextAppearanceLabel(next: Appearance) {
  if (next === "light") return "Switch to light mode";
  if (next === "dark") return "Switch to dark mode";
  return "Switch to system color mode";
}
