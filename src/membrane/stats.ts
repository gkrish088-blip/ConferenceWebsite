export type LegendItem = { key: string; color: string; count: number };
export type Stats = { scene: string; items: LegendItem[] };

let current: Stats = { scene: "", items: [] };
const listeners = new Set<() => void>();

export const subscribeStats = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getStats = () => current;
export function setStats(next: Stats) {
  current = next;
  listeners.forEach((listener) => listener());
}
