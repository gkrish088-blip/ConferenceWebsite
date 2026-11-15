import { describe, it, expect } from "vitest";
import {
  pairForce,
  clickImpulse,
  newMotion,
  stepMotion,
  rejectionGate,
} from "../src/lib/flow-physics";
describe("qualitative flow physics", () => {
  it("attracts unlike ions, repels either like-charge pair and leaves water neutral", () => {
    expect(pairForce(50, 0, 1, -1).x).toBeLessThan(0);
    expect(pairForce(50, 0, -1, -1).x).toBeGreaterThan(0);
    expect(pairForce(50, 0, 1, 1).x).toBeGreaterThan(0);
    expect(pairForce(50, 0, 0, -1)).toEqual({ x: 0, y: 0 });
  });
  it("has equal opposite pair forces, screening, and short-range separation", () => {
    const a = pairForce(50, 30, 1, -1),
      b = pairForce(-50, -30, -1, 1);
    expect(a.x).toBeCloseTo(-b.x);
    expect(a.y).toBeCloseTo(-b.y);
    expect(pairForce(10, 0, 1, -1).x).toBeGreaterThan(0);
    expect(pairForce(0, 0, 1, -1)).toEqual({ x: 0, y: 0 });
    expect(pairForce(200, 0, 1, -1)).toEqual({ x: 0, y: 0 });
  });
  it("repels radially over 260px, including beyond the old click radius", () => {
    expect(clickImpulse(200, 0).x).toBeGreaterThan(0);
    expect(clickImpulse(-200, 0).x).toBeLessThan(0);
    expect(clickImpulse(0, -100).y).toBeLessThan(0);
    expect(clickImpulse(261, 0)).toEqual({ x: 0, y: 0 });
    expect(Number.isFinite(clickImpulse(0, 0).x)).toBe(true);
  });
  it("stays bounded under repeated impulses and settles independently of frame rate", () => {
    const result = [];
    for (const hz of [30, 60, 120]) {
      const p = newMotion();
      p.ux = 620;
      for (let i = 0; i < hz * 3; i++) stepMotion(p, 1 / hz);
      expect(Math.abs(p.dx)).toBeLessThan(100);
      expect(Number.isFinite(p.ux)).toBe(true);
      result.push(p.dx);
    }
    expect(Math.max(...result) - Math.min(...result)).toBeLessThan(2);
  });
  it("rejects both ion signs at RO, while water has no rejection gate", () => {
    expect(rejectionGate[1]).toBe(3);
    expect(rejectionGate[2]).toBe(3);
    expect(rejectionGate[0]).toBe(Infinity);
  });
});
