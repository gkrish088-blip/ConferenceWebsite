// Qualitative, screen-space interactions. No SI units, Debye length or MD claim.
export type Motion = {
  dx: number;
  dy: number;
  ux: number;
  uy: number;
  fx: number;
  fy: number;
};
export const newMotion = (): Motion => ({
  dx: 0,
  dy: 0,
  ux: 0,
  uy: 0,
  fx: 0,
  fy: 0,
});
export const CLICK_RADIUS = 260;
export const rejectionGate = [Infinity, 3, 3, 2, 0, 1] as const;
export const ionCharge = (kind: number) =>
  kind === 1 ? 1 : kind === 2 ? -1 : 0;
export function pairForce(dx: number, dy: number, qa: number, qb: number) {
  const r = Math.hypot(dx, dy);
  if (!qa || !qb || r > 170 || r < 0.001) return { x: 0, y: 0 };
  const screened = (qa * qb * 160000 * Math.exp(-r / 95)) / (r * r + 324);
  // Hydration/excluded-volume stand-in prevents unlike ions collapsing together.
  const separation = r < 23 ? (23 - r) * 28 : 0;
  const f = Math.max(-110, Math.min(300, screened + separation));
  return { x: (dx / r) * f, y: (dy / r) * f };
}
export function clickImpulse(dx: number, dy: number, radius = CLICK_RADIUS) {
  const d = Math.hypot(dx, dy);
  if (d >= radius) return { x: 0, y: 0 };
  const strength = 620 * Math.pow(1 - d / radius, 0.8);
  // Exact-centre presses still have a defined outward direction.
  return {
    x: (d < 0.01 ? 1 : dx / d) * strength,
    y: (d < 0.01 ? 0 : dy / d) * strength,
  };
}
export function stepMotion(p: Motion, dt: number) {
  if (!dt) return;
  // Fluid drag and a weak return to the advected streamline; split into stable substeps.
  const steps = Math.max(1, Math.ceil(dt / (1 / 120))),
    h = dt / steps;
  for (let i = 0; i < steps; i++) {
    p.ux += (p.fx - 1.1 * p.dx) * h;
    p.uy += (p.fy - 1.1 * p.dy) * h;
    const drag = Math.exp(-3.2 * h);
    p.ux *= drag;
    p.uy *= drag;
    const speed = Math.hypot(p.ux, p.uy);
    if (speed > 650) {
      p.ux *= 650 / speed;
      p.uy *= 650 / speed;
    }
    p.dx += p.ux * h;
    p.dy += p.uy * h;
  }
  p.fx = 0;
  p.fy = 0;
}
