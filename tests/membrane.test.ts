import { describe, expect, it } from "vitest";
import { World } from "../src/membrane/engine";
import { buildScene, sceneIds } from "../src/membrane/scenes";

function run(
  id: (typeof sceneIds)[number],
  W: number,
  H: number,
  secs: number,
) {
  const w = new World(W, H, buildScene(id, W, H));
  const steps = Math.round(secs * 60);
  for (let i = 0; i < steps; i++) {
    w.step(1 / 60);
    for (const p of w.ps) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y))
        throw new Error(`NaN in ${id}`);
    }
  }
  return w;
}

describe("membrane scenes", () => {
  for (const id of sceneIds) {
    it(`${id} stays finite and in bounds`, () => {
      const w = run(id, 1280, 800, 20);
      const out = w.ps.filter(
        (p) => p.x < -40 || p.x > 1320 || p.y < -80 || p.y > 880,
      );
      console.log(id, JSON.stringify(w.crossed), "n=", w.ps.length);
      if (out.length)
        console.log(
          "OOB",
          id,
          JSON.stringify(
            out.map((p) => [
              p.sp.key,
              p.x | 0,
              p.y | 0,
              p.vx | 0,
              p.vy | 0,
              p.st,
            ]),
          ),
        );
      expect(out.length).toBe(0);
    });
  }
  it("is selective", () => {
    const ro = run("ro", 1280, 800, 40);
    expect(ro.crossed.water).toBeGreaterThan(40);
    expect(ro.crossed.na + ro.crossed.cl).toBeLessThan(ro.crossed.water * 0.05);
    const g = run("gas", 1280, 800, 40);
    expect(g.crossed.co2).toBeGreaterThan(g.crossed.n2 * 2);
    const n = run("nanopore", 1280, 800, 40);
    console.log("NP", JSON.stringify(n.crossed));
    expect(n.crossed.k).toBeGreaterThan(n.crossed.na * 2);
    const d = run("dialysis", 1280, 800, 40);
    console.log("DI", JSON.stringify(d.crossed));
    expect(d.crossed.urea).toBeGreaterThan(10);
    expect(d.crossed.rbc + d.crossed.albumin).toBe(0);
  });
});
