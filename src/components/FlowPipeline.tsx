import { useEffect, useRef } from "react";
import styles from "../styles/flow-example.module.css";
import {
  type Motion,
  newMotion,
  CLICK_RADIUS,
  rejectionGate,
  ionCharge,
  pairForce,
  clickImpulse,
  stepMotion,
} from "../lib/flow-physics";

type Point = { x: number; y: number; d: number };
type Tank = { x: number; y: number; w: number; h: number; clean: boolean };
type TapSpring = Motion & { kind: number };
type ReservoirParticle = TapSpring & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: number;
  angle: number;
  tank: number;
};
type Particle = TapSpring & {
  kind: number;
  d: number;
  offset: number;
  push: number;
  angle: number;
  rebound: number;
};
const tau = Math.PI * 2;

export function FlowPipeline({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pause = useRef(paused);
  const restart = useRef<() => void>(() => {});
  useEffect(() => {
    pause.current = paused;
    restart.current();
  }, [paused]);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let sea = "#8fb5a8",
      copper = "#c98d6b",
      pearl = "#ede8dd",
      ink = "#101a17";
    let tankFill = "#14251e",
      pipeOuter = "#152820",
      pipeMid = "#1b3128",
      pipeInner = "#172a23";
    function readColors() {
      const light =
        canvas.closest("[data-theme]")?.getAttribute("data-theme") === "light";
      sea = light ? "#527d6d" : "#8fb5a8";
      copper = light ? "#a8694a" : "#c98d6b";
      pearl = light ? "#1b2421" : "#ede8dd";
      ink = light ? "#f2f0ea" : "#101a17";
      tankFill = light ? "#e9ece3" : "#14251e";
      pipeOuter = light ? "#d3e0d6" : "#152820";
      pipeMid = light ? "#e3ebe1" : "#1b3128";
      pipeInner = light ? "#dce6dc" : "#172a23";
    }
    let points: Point[] = [],
      gates: Point[] = [],
      particles: Particle[] = [];
    let tanks: Tank[] = [],
      reservoir: ReservoirParticle[] = [];
    let width = 0,
      height = 0,
      length = 0,
      scroll = window.scrollY,
      raf = 0,
      last = 0;
    let active = true,
      disposed = false;
    let ripples: { x: number; y: number; age: number }[] = [];
    let hitTargets: { x: number; y: number; particle: TapSpring }[] = [];
    let pointer: { x: number; y: number } | null = null;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(pointer: fine)");
    const cutoff = rejectionGate;
    const jitter = (n: number) => (Math.sin(n * 912.37) * 43758.54) % 1;
    const clamp = (n: number, a: number, b: number) =>
      Math.max(a, Math.min(b, n));
    function at(d: number): Point {
      let lo = 0,
        hi = points.length - 1;
      while (hi - lo > 1) {
        const m = (lo + hi) >> 1;
        if (points[m].d < d) lo = m;
        else hi = m;
      }
      const a = points[lo],
        b = points[hi],
        t = clamp((d - a.d) / Math.max(1, b.d - a.d), 0, 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, d };
    }
    function size() {
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const hero = document.querySelector<HTMLElement>("[data-flow-hero]")!;
      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>("[data-flow-node]"),
      );
      const mobile = width < 760;
      // Art-directed irregular bends: stable across frames, without a repeating zigzag.
      const gatePositions = [0.82, 0.68, 0.22, 0.37, 0.78];
      const bendPositions = [0.2, 0.88, 0.5, 0.13];
      const bendDepths = [0.53, 0.4, 0.61, 0.48];
      const side = (i: number) =>
        width * gatePositions[i % gatePositions.length];
      const heroTop = hero.getBoundingClientRect().top + scrollY;
      const lastSection = document.querySelector<HTMLElement>("#contact")!;
      const lastTop = lastSection.getBoundingClientRect().top + scrollY;
      const margin = mobile ? 12 : width * 0.035;
      tanks = [
        {
          x: margin,
          y: heroTop + 14,
          w: width - margin * 2,
          h: hero.offsetHeight - 14,
          clean: false,
        },
        {
          x: margin,
          y: lastTop + 14,
          w: width - margin * 2,
          h: lastSection.offsetHeight - 28,
          clean: true,
        },
      ];
      // The source is a full vessel; the narrow pipe begins only at its bottom outlet.
      const nodes = [{ x: side(0), y: tanks[0].y + tanks[0].h - 4 }];
      anchors.forEach((el, i) => {
        const gateY =
          el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2;
        nodes.push({ x: side(i), y: gateY });
        const next = anchors[i + 1];
        if (next) {
          const nextY =
            next.getBoundingClientRect().top + scrollY + next.offsetHeight / 2;
          nodes.push({
            x: width * bendPositions[i],
            y: gateY + (nextY - gateY) * bendDepths[i],
          });
        }
      });
      // The last membrane discharges into a complete clean-water vessel.
      nodes.push({ x: side(anchors.length - 1), y: tanks[1].y + 30 });
      reservoir = tanks.flatMap((tank, t) =>
        Array.from({ length: mobile ? 42 : 66 }, (_, i) => ({
          x: tank.x + 20 + Math.abs(jitter(i + 31 + t * 80)) * (tank.w - 40),
          y: tank.y + 30 + Math.abs(jitter(i + 97 + t * 90)) * (tank.h - 60),
          vx: 9 + Math.abs(jitter(i + 8)) * 8,
          vy: 4 + jitter(i + 58) * 8,
          kind: t === 1 ? 0 : i % 6,
          angle: i * 1.4,
          tank: t,
          ...newMotion(),
        })),
      );
      points = [];
      length = 0;
      for (let i = 0; i < nodes.length - 1; i++) {
        const b = nodes[i],
          c = nodes[i + 1];
        for (let j = 0; j < 96; j++) {
          const t = j / 95;
          // Quintic easing keeps both slope and curvature continuous at every join.
          // Monotonic vertical movement prevents spline overshoots or tight hooks.
          const bend = t * t * t * (t * (t * 6 - 15) + 10);
          const p = {
            x: b.x + (c.x - b.x) * bend,
            y: b.y + (c.y - b.y) * t,
            d: 0,
          };
          const prev = points.at(-1);
          if (prev) length += Math.hypot(p.x - prev.x, p.y - prev.y);
          p.d = length;
          points.push(p);
        }
      }
      gates = anchors.slice(0, 5).map((el) => {
        const y =
          el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2;
        return points.reduce(
          (best, p) => (Math.abs(p.y - y) < Math.abs(best.y - y) ? p : best),
          points[0],
        );
      });
      particles = Array.from({ length: mobile ? 100 : 154 }, (_, i) => {
        const kind = i % 8 < 3 ? 0 : (i % 8) - 2;
        const end = kind === 0 ? length : gates[cutoff[kind]].d;
        return {
          kind,
          d: ((i * 0.61803398875) % 1) * end,
          offset: jitter(i + 5) * (mobile ? 13 : 32),
          push: 0,
          angle: i * 1.4,
          rebound: 0,
          ...newMotion(),
        };
      });
      draw(performance.now());
    }
    function dot(x: number, y: number, r: number, color: string) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, tau);
      ctx.fill();
    }
    function shape(p: Pick<Particle, "kind" | "angle">, x: number, y: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.kind === 1 || p.kind === 2 ? 0 : p.angle);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = sea;
      if (p.kind === 0) {
        ctx.beginPath();
        ctx.moveTo(-6.32, -4.9);
        ctx.lineTo(0, 0);
        ctx.lineTo(6.32, -4.9);
        ctx.stroke();
        dot(0, 0, 4, sea);
        dot(-6.32, -4.9, 1.9, pearl);
        dot(6.32, -4.9, 1.9, pearl);
      } else if (p.kind < 3) {
        dot(0, 0, p.kind === 1 ? 6 : 7, p.kind === 1 ? copper : sea);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-2.5, 0);
        ctx.lineTo(2.5, 0);
        if (p.kind === 1) {
          ctx.moveTo(0, -2.5);
          ctx.lineTo(0, 2.5);
        }
        ctx.stroke();
        ctx.strokeStyle = sea;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, tau);
        ctx.stroke();
      } else if (p.kind === 3) {
        for (const cx of [-5, 5]) {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k * tau) / 6;
            ctx.lineTo(cx + Math.cos(a) * 6, Math.sin(a) * 6);
          }
          ctx.closePath();
          ctx.stroke();
        }
      } else if (p.kind === 4) {
        dot(-4, 2, 4, pearl);
        dot(3, 3, 4, sea);
        dot(0, -3, 4, sea);
      } else {
        ctx.strokeStyle = pearl;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.bezierCurveTo(-6, -12, 4, 12, 8, -3);
        ctx.bezierCurveTo(12, -10, -4, -10, -6, 2);
        ctx.bezierCurveTo(-9, 13, 8, 10, 11, 4);
        ctx.stroke();
      }
      ctx.restore();
    }
    function draw(now: number) {
      cancelAnimationFrame(raf);
      if (disposed || !points.length) return;
      const moving = active && !pause.current && !reduced.matches;
      const dt = moving ? Math.min((now - (last || now)) / 1000, 0.035) : 0;
      last = now;
      ctx.clearRect(0, 0, width, height);
      // Apply equal and opposite forces using cached, actually drawn positions.
      const ions = hitTargets.filter((t) => ionCharge(t.particle.kind));
      if (dt)
        for (let i = 0; i < ions.length; i++)
          for (let j = i + 1; j < ions.length; j++) {
            const a = ions[i],
              b = ions[j];
            const f = pairForce(
              a.x - b.x,
              a.y - b.y,
              ionCharge(a.particle.kind),
              ionCharge(b.particle.kind),
            );
            a.particle.fx += f.x;
            a.particle.fy += f.y;
            b.particle.fx -= f.x;
            b.particle.fy -= f.y;
          }
      hitTargets = [];
      const tube = width < 760 ? 47 : 112;
      ctx.save();
      ctx.translate(0, -scroll);
      for (const tank of tanks) {
        if (tank.y + tank.h < scroll || tank.y > scroll + height) continue;
        ctx.beginPath();
        ctx.roundRect(tank.x, tank.y, tank.w, tank.h, 28);
        ctx.fillStyle = tankFill;
        ctx.fill();
        ctx.strokeStyle = sea + "4a";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(tank.x + 7, tank.y + 7, tank.w - 14, tank.h - 14, 22);
        ctx.strokeStyle = sea + "18";
        ctx.stroke();
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        0,
        tanks[0].y + tanks[0].h,
        width,
        tanks[1].y + 40 - (tanks[0].y + tanks[0].h),
      );
      ctx.clip();
      // One cached geometry; only its visible portion is painted. No DOM animation or layout reads here.
      ctx.beginPath();
      let started = false;
      for (const p of points) {
        if (p.y < scroll - 180 || p.y > scroll + height + 180) continue;
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = sea + "70";
      ctx.lineWidth = tube + 2;
      ctx.stroke();
      ctx.strokeStyle = pipeOuter;
      ctx.lineWidth = tube;
      ctx.stroke();
      ctx.strokeStyle = pipeMid;
      ctx.lineWidth = tube - 8;
      ctx.stroke();
      ctx.strokeStyle = pipeInner;
      ctx.lineWidth = tube - 15;
      ctx.stroke();
      for (let index = 0; index < gates.length; index++) {
        const g = gates[index];
        if (g.y < scroll - 80 || g.y > scroll + height + 80) continue;
        const next = at(g.d + 3),
          angle = Math.atan2(next.y - g.y, next.x - g.x);
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(angle);
        ctx.fillStyle = ink;
        ctx.strokeStyle = sea;
        ctx.lineWidth = 0.8;
        ctx.fillRect(-12, -tube / 2 - 5, 24, tube + 10);
        ctx.strokeRect(-12, -tube / 2 - 5, 24, tube + 10);
        if (index >= 3) {
          // Dense RO selective skin and supporting layers: never draw literal open pores.
          ctx.fillStyle = sea;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(-3, -tube / 2, 2, tube);
          ctx.globalAlpha = 0.25;
          ctx.fillRect(1, -tube / 2, 5, tube);
          ctx.globalAlpha = 1;
        } else if (index === 1) {
          // Hollow-fibre bundle, diagrammatic cross-section.
          for (let y = -tube / 2 + 7; y < tube / 2; y += 10) {
            ctx.beginPath();
            ctx.ellipse(0, y, 7, 3, 0, 0, tau);
            ctx.stroke();
          }
        } else {
          const spacing = index === 0 ? 18 : 9;
          for (let y = -tube / 2 + 7; y < tube / 2; y += spacing) {
            ctx.beginPath();
            ctx.arc(0, y, index === 0 ? 4 : 1.8, 0, tau);
            ctx.stroke();
          }
        }
        dot(-17, 0, 2.5, copper);
        ctx.restore();
      }
      ctx.restore();
      for (const p of reservoir) {
        const tank = tanks[p.tank];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (pointer && dt) {
          const dx = p.x - pointer.x,
            dy = p.y - (pointer.y + scroll),
            distance = Math.hypot(dx, dy);
          if (distance < 85) {
            const f = (1 - distance / 85) * 45 * dt;
            p.x += (dx / Math.max(1, distance)) * f;
            p.y += (dy / Math.max(1, distance)) * f;
          }
        }
        if (p.x < tank.x + 16 || p.x > tank.x + tank.w - 16) p.vx *= -1;
        if (p.y < tank.y + 16 || p.y > tank.y + tank.h - 16) p.vy *= -1;
        p.x = clamp(p.x, tank.x + 16, tank.x + tank.w - 16);
        p.y = clamp(p.y, tank.y + 16, tank.y + tank.h - 16);
        if (p.y < scroll - 20 || p.y > scroll + height + 20) continue;
        p.angle += dt * 0.18;
        stepMotion(p, dt);
        const x = clamp(p.x + p.dx, tank.x + 12, tank.x + tank.w - 12);
        const y = clamp(p.y + p.dy, tank.y + 12, tank.y + tank.h - 12);
        if (x !== p.x + p.dx) {
          p.dx = x - p.x;
          p.ux *= -0.35;
        }
        if (y !== p.y + p.dy) {
          p.dy = y - p.y;
          p.uy *= -0.35;
        }
        hitTargets.push({ x, y, particle: p });
        ctx.globalAlpha = 0.64;
        shape(p, x, y);
        ctx.globalAlpha = 1;
      }
      for (const p of particles) {
        const end = p.kind === 0 ? length : gates[cutoff[p.kind]].d - 18;
        if (p.rebound > 0) {
          p.rebound -= dt;
          p.d -= dt * 28;
          if (p.rebound <= 0) {
            p.d = 0;
            p.push = 0;
          }
        } else {
          p.d += dt * (p.kind === 0 ? 72 : 58);
          if (p.d >= end) {
            if (p.kind === 0) p.d = 0;
            else {
              p.d = end;
              p.rebound = 0.8;
            }
          }
        }
        const pos = at(p.d);
        if (pos.y < scroll - 35 || pos.y > scroll + height + 35) continue;
        const n = at(Math.min(length, p.d + 4)),
          angle = Math.atan2(n.y - pos.y, n.x - pos.x);
        let push = 0;
        if (pointer) {
          const dx = pos.x - pointer.x,
            dy = pos.y - (pointer.y + scroll),
            d = Math.hypot(dx, dy);
          if (d < 95)
            push =
              ((dx * Math.cos(angle + Math.PI / 2) +
                dy * Math.sin(angle + Math.PI / 2)) /
                Math.max(1, d)) *
              (1 - d / 95) *
              45;
        }
        p.push += (push - p.push) * Math.min(1, dt * 8);
        p.angle += dt * 0.25;
        stepMotion(p, dt);
        const nx = Math.cos(angle + Math.PI / 2),
          ny = Math.sin(angle + Math.PI / 2);
        const tx = Math.cos(angle),
          ty = Math.sin(angle);
        const normal = p.dx * nx + p.dy * ny;
        const offset = clamp(
          p.offset + p.push + normal,
          -tube / 2 + 12,
          tube / 2 - 12,
        );
        const effectiveD = clamp(p.d + p.dx * tx + p.dy * ty, 0, end);
        const shifted = at(effectiveD);
        // Clicks move along the channel as well as sideways; never through its walls or a rejecting membrane.
        const x = shifted.x + nx * offset,
          y = shifted.y + ny * offset;
        ctx.globalAlpha = p.rebound > 0 ? Math.max(0.1, p.rebound / 0.8) : 0.86;
        hitTargets.push({ x, y, particle: p });
        shape(p, x, y);
        ctx.globalAlpha = 1;
      }
      for (const ripple of ripples) {
        ripple.age += dt;
        const t = Math.min(1, ripple.age / 0.7);
        const eased = 1 - Math.pow(1 - t, 3);
        ctx.strokeStyle = copper;
        ctx.globalAlpha = (1 - t) * (1 - t) * 0.7;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, 5 + eased * CLICK_RADIUS, 0, tau);
        ctx.stroke();
      }
      ripples = ripples.filter((r) => r.age < 0.7);
      ctx.globalAlpha = 1;
      ctx.restore();
      canvas.dataset.motion = moving ? "running" : "static";
      if (moving) raf = requestAnimationFrame(draw);
    }
    function kick() {
      last = 0;
      draw(performance.now());
    }
    restart.current = kick;
    const themeChanged = () => {
      readColors();
      if (pause.current || reduced.matches) kick();
    };
    document.addEventListener("flow:theme", themeChanged);
    readColors();
    const onScroll = () => {
      scroll = scrollY;
      if (pause.current || reduced.matches) kick();
    };
    const onMove = (e: PointerEvent) => {
      if (fine.matches) pointer = { x: e.clientX, y: e.clientY };
    };
    const onTap = (e: PointerEvent) => {
      if (
        e.button !== 0 ||
        (e.target instanceof Element &&
          e.target.closest("a, button, input, summary"))
      )
        return;
      const x = e.clientX,
        y = e.clientY + scroll;
      if (reduced.matches || pause.current) return;
      // A radial impulse repels every species, including neutral water and organics.
      let affected = false;
      for (const target of hitTargets) {
        const impulse = clickImpulse(target.x - x, target.y - y);
        if (impulse.x || impulse.y) {
          target.particle.ux += impulse.x;
          target.particle.uy += impulse.y;
          affected = true;
        }
      }
      if (affected) {
        ripples.push({ x, y, age: 0 });
        if (ripples.length > 5) ripples.shift();
      }
      // Existing RAF handles the next frame; do not restart/reset its clock on clicks.
    };
    const visibility = () => {
      active = !document.hidden;
      kick();
    };
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onTap, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", kick);
    const layout = new ResizeObserver(onResize);
    layout.observe(document.querySelector("main")!);
    size();
    document.fonts.ready.then(() => {
      if (!disposed) size();
    });
    return () => {
      disposed = true;
      document.removeEventListener("flow:theme", themeChanged);
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      layout.disconnect();
      restart.current = () => {};
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onTap);
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", kick);
    };
  }, []);
  return <canvas ref={ref} className={styles.pipeline} aria-hidden="true" />;
}
