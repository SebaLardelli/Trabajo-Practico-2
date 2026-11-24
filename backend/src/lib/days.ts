const ZONE = "America/Argentina/Buenos_Aires";

export function todayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseDay(value: string): Date {
  const key = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    throw new Error("Fecha invalida");
  }
  return new Date(`${key}T15:00:00.000Z`);
}

export function dayKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function addDays(key: string, days: number): string {
  const date = parseDay(key);
  date.setUTCDate(date.getUTCDate() + days);
  return dayKey(date);
}

export function formatDay(value: Date | string): string {
  const key = typeof value === "string" ? value.slice(0, 10) : dayKey(value);
  const [year, month, day] = key.split("-");
  return `${day}/${month}/${year}`;
}
