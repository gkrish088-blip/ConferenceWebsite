export type DateStatus = "past" | "next" | "upcoming";

export type DatedItem = { date: string };

export function getMilestoneStatuses<T extends DatedItem>(
  items: T[],
  nowMs: number,
): Array<T & { status: DateStatus }> {
  const nextIndex = items.findIndex((item) => Date.parse(item.date) >= nowMs);

  return items.map((item, index) => ({
    ...item,
    status:
      Date.parse(item.date) < nowMs
        ? "past"
        : index === nextIndex
          ? "next"
          : "upcoming",
  }));
}

export function formatMilestoneDate(iso: string, showTime = false): string {
  const date = new Date(iso);
  const dateText = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
  if (!showTime) return dateText;

  const timeText = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    timeZoneName: "short",
  }).format(date);
  return `${dateText}, ${timeText}`;
}

export function getRiverPoints(
  count: number,
  width = 1120,
  height = 420,
  labelWidth = 180,
) {
  const padding = Math.min(labelWidth / 2, width / 2);
  const middle = height / 2;
  const span = width - padding * 2;

  return Array.from({ length: count }, (_, index) => {
    const position = count <= 1 ? 0.5 : index / (count - 1);
    const x = padding + span * position;
    const y =
      middle + Math.sin(position * Math.PI * 2) * Math.min(24, height * 0.07);
    return { x, y, position };
  });
}

export function getRiverPath(
  points: Array<{ x: number; y: number }>,
  width = 1120,
): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const point = points[0];
    return `M 0 ${point.y} C ${width / 3} ${point.y}, ${(width * 2) / 3} ${point.y}, ${width} ${point.y}`;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const start = `M 0 ${first.y} C ${first.x / 3} ${first.y}, ${(first.x * 2) / 3} ${first.y}, ${first.x} ${first.y}`;
  const throughPoints = points.slice(1).reduce((path, point, index) => {
    const previous = points[index];
    const dx = (point.x - previous.x) / 3;
    const dy = (point.y - previous.y) * 0.38;
    return `${path} C ${previous.x + dx} ${previous.y + dy}, ${point.x - dx} ${point.y - dy}, ${point.x} ${point.y}`;
  }, start);
  const tailWidth = width - last.x;
  return `${throughPoints} C ${last.x + tailWidth / 3} ${last.y}, ${last.x + (tailWidth * 2) / 3} ${last.y}, ${width} ${last.y}`;
}

export function getVerticalRiverPath(count: number, rowHeight = 120): string {
  if (count <= 0) return "";
  const x = 15;
  const start = rowHeight / 2;
  if (count === 1) return `M ${x} 0 C 8 18, 22 38, ${x} ${start}`;
  return Array.from({ length: count - 1 }, (_, index) => {
    const y = start + index * rowHeight;
    return index === 0
      ? `M ${x} ${y} C 5 ${y + rowHeight / 3}, 25 ${y + (rowHeight * 2) / 3}, ${x} ${y + rowHeight}`
      : `S 25 ${y + rowHeight * 0.4}, ${x} ${y + rowHeight}`;
  }).join(" ");
}
