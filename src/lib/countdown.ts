export type CountdownState = "before" | "live" | "ended";

export type CountdownResult = {
  state: CountdownState;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function getCountdown(
  targetISO: string,
  nowMs: number,
  eventEndISO?: string,
): CountdownResult {
  const targetMs = Date.parse(targetISO);
  const endMs = eventEndISO ? Date.parse(eventEndISO) : undefined;

  if (endMs !== undefined && nowMs > endMs) {
    return { state: "ended", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  if (nowMs >= targetMs) {
    return { state: "live", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSeconds = Math.floor((targetMs - nowMs) / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return { state: "before", days, hours, minutes, seconds };
}

export function formatConferenceDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}
