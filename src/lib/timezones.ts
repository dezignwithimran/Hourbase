export const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "CAD", "AUD"] as const;

const REGION_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  PK: "PKR",
  IN: "INR",
  CA: "CAD",
  AU: "AUD",
  NZ: "AUD",
  DE: "EUR",
  FR: "EUR",
  NL: "EUR",
  ES: "EUR",
  IT: "EUR",
  IE: "EUR",
  PT: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
};

export function detectCurrency(): string {
  if (typeof navigator === "undefined") return "USD";
  try {
    const locale = new Intl.Locale(navigator.language);
    const region =
      locale.region ||
      (typeof locale.maximize === "function" ? locale.maximize().region : undefined);
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  } catch {
    /* keep USD */
  }
  return "USD";
}

function timeZoneLabel(tz: string): string {
  try {
    const offset =
      new Intl.DateTimeFormat("en", {
        timeZone: tz,
        timeZoneName: "shortOffset",
        hour: "numeric",
      })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value ?? "";
    return offset ? `${tz.replace(/_/g, " ")} (${offset})` : tz.replace(/_/g, " ");
  } catch {
    return tz.replace(/_/g, " ");
  }
}

let cached: { value: string; label: string }[] | null = null;

export function timeZoneOptions(): { value: string; label: string }[] {
  if (cached) return cached;
  const zones =
    typeof Intl !== "undefined" && "supportedValuesOf" in Intl
      ? Intl.supportedValuesOf("timeZone")
      : [Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"];
  cached = zones.map((value) => ({ value, label: timeZoneLabel(value) }));
  return cached;
}
