let snapshot: number | undefined;
export function setRenderTime(value: number) {
  snapshot = value;
}
export function renderTime() {
  return (
    snapshot ??
    (typeof window !== "undefined"
      ? window.__CONFERENCE_BUILD_TIME__
      : undefined) ??
    Date.now()
  );
}
declare global {
  interface Window {
    __CONFERENCE_BUILD_TIME__?: number;
  }
}
