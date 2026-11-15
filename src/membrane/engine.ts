/* Small particle-physics engine for the membrane backgrounds.
 * Overdamped Langevin motion (Ornstein-Uhlenbeck velocity), hard-sphere
 * collisions with a thermally wobbling polymer matrix, and pair collisions. */

export type Pal = {
  dark: boolean;
  bg: string;
  ink: string;
  silt: string;
  river: string;
  marigold: string;
  membrane: string;
  water: string;
  cation: string;
  anion: string;
  foul: string;
};

export type Obs = {
  x: number;
  y: number;
  r: number;
  ph: number;
  a: number;
  k: number;
  cx: number;
  cy: number;
};

export type Look =
  | "dot"
  | "plus"
  | "minus"
  | "cell"
  | "blob"
  | "pm"
  | "dimer"
  | "electron"
  | "shell"
  | "air";

export type Sp = {
  key: string;
  r: number;
  m: number;
  gamma: number;
  sigma: number;
  look: Look;
  col: (p: Pal) => string;
  drive?: (w: World, p: P) => void;
  ghost?: boolean;
  stick?: boolean;
};

export type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sp: Sp;
  r: number;
  st: number;
  t: number;
  f: number;
  side: number;
  ang: number;
  s: number;
};

export interface Scene {
  species: Sp[];
  counts: number[];
  obstacles: Obs[];
  spawn(w: World, p: P): void;
  edge(w: World, p: P): boolean;
  update?(w: World, p: P, dt: number): boolean | void;
  side?(p: P): number;
  paintBack?(w: World, ctx: CanvasRenderingContext2D, pal: Pal): void;
  paintFront?(w: World, ctx: CanvasRenderingContext2D, pal: Pal): void;
  drawParticle?(
    w: World,
    ctx: CanvasRenderingContext2D,
    p: P,
    pal: Pal,
  ): boolean;
  tick?(w: World, dt: number): void;
}

let spare: number | null = null;
export function randn(): number {
  if (spare !== null) {
    const s = spare;
    spare = null;
    return s;
  }
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const m = Math.sqrt(-2 * Math.log(u));
  spare = m * Math.sin(2 * Math.PI * v);
  return m * Math.cos(2 * Math.PI * v);
}

export function makeObs(x: number, y: number, r: number, k = 0, a = 1.1): Obs {
  return { x, y, r, ph: Math.random() * 6.28, a, k, cx: x, cy: y };
}

const CELL = 36;

export class World {
  ux = 0;
  uy = 0;
  time = 0;
  ps: P[] = [];
  crossed: Record<string, number> = {};
  private gw: number;
  private gh: number;
  private ogrid: number[][];
  private head: Int32Array;
  private next: Int32Array;
  private dirty = false;

  constructor(
    public W: number,
    public H: number,
    public scene: Scene,
  ) {
    this.gw = Math.ceil(W / CELL) + 1;
    this.gh = Math.ceil(H / CELL) + 1;
    this.ogrid = Array.from({ length: this.gw * this.gh }, () => []);
    scene.obstacles.forEach((o, i) => {
      const gx = Math.min(this.gw - 1, Math.max(0, Math.floor(o.x / CELL)));
      const gy = Math.min(this.gh - 1, Math.max(0, Math.floor(o.y / CELL)));
      this.ogrid[gy * this.gw + gx].push(i);
    });
    this.head = new Int32Array(this.gw * this.gh);
    this.next = new Int32Array(0);
    scene.species.forEach((sp, i) => {
      this.crossed[sp.key] = 0;
      for (let n = 0; n < scene.counts[i]; n++) this.add(sp);
    });
  }

  add(sp: Sp): P {
    const p: P = {
      x: 0,
      y: 0,
      vx: sp.sigma * randn(),
      vy: sp.sigma * randn(),
      sp,
      r: sp.r,
      st: 0,
      t: 0,
      f: 0,
      side: 0,
      ang: Math.random() * 6.28,
      s: 0,
    };
    this.scene.spawn(this, p);
    p.side = this.scene.side ? this.scene.side(p) : 0;
    this.ps.push(p);
    return p;
  }

  kill(p: P) {
    p.st = -9;
    this.dirty = true;
  }

  respawn(p: P) {
    p.st = 0;
    p.r = p.sp.r;
    p.vx = p.sp.sigma * randn();
    p.vy = p.sp.sigma * randn();
    this.scene.spawn(this, p);
    p.side = this.scene.side ? this.scene.side(p) : 0;
  }

  step(dt: number) {
    const sc = this.scene;
    this.time += dt;
    for (const o of sc.obstacles) {
      o.cx = o.x + Math.sin(this.time * 3 + o.ph) * o.a;
      o.cy = o.y + Math.cos(this.time * 3.7 + o.ph) * o.a;
    }
    sc.tick?.(this, dt);
    const ps = this.ps;
    for (const p of ps) {
      if (p.st === -9) continue;
      if (p.f > 0) p.f = Math.max(0, p.f - dt * 2.5);
      const sp = p.sp;
      if (p.st === 1 && sp.stick) continue;
      this.ux = 0;
      this.uy = 0;
      sp.drive?.(this, p);
      const g = Math.min(0.9, sp.gamma * dt);
      const s = sp.sigma * Math.sqrt(2 * g);
      p.vx += (this.ux - p.vx) * g + s * randn();
      p.vy += (this.uy - p.vy) * g + s * randn();
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (sc.edge(this, p)) continue;
      this.collideObs(p);
    }
    this.collidePairs();
    for (const p of ps) {
      if (p.st === -9) continue;
      if (p.st === 1 && p.sp.stick) {
        if (sc.update?.(this, p, dt) === false) this.respawn(p);
        continue;
      }
      if (sc.update?.(this, p, dt) === false) {
        this.respawn(p);
        continue;
      }
      if (sc.side) {
        const sd = sc.side(p);
        if (sd !== p.side) {
          if (p.side === 0 && sd === 1) this.crossed[p.sp.key]++;
          p.side = sd;
        }
      }
    }
    if (this.dirty) {
      this.ps = this.ps.filter((p) => p.st !== -9);
      this.dirty = false;
    }
  }

  private collideObs(p: P) {
    const obs = this.scene.obstacles;
    const gx = Math.floor(p.x / CELL);
    const gy = Math.floor(p.y / CELL);
    for (let j = gy - 1; j <= gy + 1; j++) {
      if (j < 0 || j >= this.gh) continue;
      for (let i = gx - 1; i <= gx + 1; i++) {
        if (i < 0 || i >= this.gw) continue;
        for (const idx of this.ogrid[j * this.gw + i]) {
          const o = obs[idx];
          const dx = p.x - o.cx;
          const dy = p.y - o.cy;
          const rr = p.r + o.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr) continue;
          const d = Math.sqrt(d2) || 0.001;
          const nx = dx / d;
          const ny = dy / d;
          p.x = o.cx + nx * rr;
          p.y = o.cy + ny * rr;
          const vn = p.vx * nx + p.vy * ny;
          if (vn < 0) {
            p.vx -= 1.5 * vn * nx;
            p.vy -= 1.5 * vn * ny;
          }
          if (p.sp.stick && p.st === 0 && Math.random() < 0.85) {
            p.st = 1;
            p.vx = 0;
            p.vy = 0;
            p.t = this.time;
            p.f = 1;
          }
        }
      }
    }
  }

  private collidePairs() {
    const ps = this.ps;
    const n = ps.length;
    if (this.next.length < n) this.next = new Int32Array(n * 2);
    this.head.fill(-1);
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      if (p.st === -9) continue;
      const gx = Math.min(this.gw - 1, Math.max(0, Math.floor(p.x / CELL)));
      const gy = Math.min(this.gh - 1, Math.max(0, Math.floor(p.y / CELL)));
      const c = gy * this.gw + gx;
      this.next[i] = this.head[c];
      this.head[c] = i;
    }
    for (let a = 0; a < n; a++) {
      const p = ps[a];
      if (p.sp.ghost || p.st === -9) continue;
      const gx = Math.min(this.gw - 1, Math.max(0, Math.floor(p.x / CELL)));
      const gy = Math.min(this.gh - 1, Math.max(0, Math.floor(p.y / CELL)));
      for (
        let j = Math.max(0, gy - 1);
        j <= Math.min(this.gh - 1, gy + 1);
        j++
      ) {
        for (
          let i = Math.max(0, gx - 1);
          i <= Math.min(this.gw - 1, gx + 1);
          i++
        ) {
          for (let b = this.head[j * this.gw + i]; b >= 0; b = this.next[b]) {
            if (b <= a) continue;
            const q = ps[b];
            if (q.sp.ghost) continue;
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const rr = p.r + q.r;
            const d2 = dx * dx + dy * dy;
            if (d2 >= rr * rr || d2 === 0) continue;
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            const pf = p.st === 1 && p.sp.stick;
            const qf = q.st === 1 && q.sp.stick;
            const mp = pf ? 1e6 : p.sp.m;
            const mq = qf ? 1e6 : q.sp.m;
            const ov = rr - d;
            const wp = mq / (mp + mq);
            const wq = mp / (mp + mq);
            if (!pf) {
              p.x -= nx * ov * wp;
              p.y -= ny * ov * wp;
            }
            if (!qf) {
              q.x += nx * ov * wq;
              q.y += ny * ov * wq;
            }
            const vn = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (vn < 0) {
              const imp = (2 * vn) / (mp + mq);
              if (!pf) {
                p.vx += imp * mq * nx;
                p.vy += imp * mq * ny;
              }
              if (!qf) {
                q.vx -= imp * mp * nx;
                q.vy -= imp * mp * ny;
              }
              if (p.sp.stick && q.sp.stick && (pf || qf) && !(pf && qf)) {
                const free = pf ? q : p;
                if (Math.random() < 0.5) {
                  free.st = 1;
                  free.vx = 0;
                  free.vy = 0;
                  free.t = this.time;
                }
              }
            }
          }
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, pal: Pal) {
    const sc = this.scene;
    sc.paintBack?.(this, ctx, pal);
    const byKind = new Map<number, Obs[]>();
    for (const o of sc.obstacles) {
      const arr = byKind.get(o.k);
      if (arr) arr.push(o);
      else byKind.set(o.k, [o]);
    }
    const m0 = byKind.get(0);
    if (m0) {
      ctx.beginPath();
      for (let i = 1; i < m0.length; i++) {
        const a = m0[i - 1];
        const b = m0[i];
        if (Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 34) {
          ctx.moveTo(a.cx, a.cy);
          ctx.lineTo(b.cx, b.cy);
        }
      }
      ctx.strokeStyle = pal.membrane;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (const [k, arr] of byKind) {
      ctx.beginPath();
      for (const o of arr) {
        ctx.moveTo(o.cx + o.r, o.cy);
        ctx.arc(o.cx, o.cy, o.r, 0, 6.2832);
      }
      ctx.fillStyle =
        k === 1
          ? pal.marigold
          : k === 2
            ? pal.ink
            : k === 3
              ? pal.river
              : pal.membrane;
      ctx.globalAlpha = k === 2 ? 0.55 : k === 1 ? 0.7 : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    for (const p of this.ps) {
      if (sc.drawParticle?.(this, ctx, p, pal)) continue;
      drawParticle(ctx, p, pal, this.time);
    }
    sc.paintFront?.(this, ctx, pal);
  }
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: P,
  pal: Pal,
  time: number,
) {
  const c = p.sp.col(pal);
  const vis = p.sp.r < 6 ? 1.35 : 1;
  const r = p.r * vis;
  ctx.fillStyle = c;
  switch (p.sp.look) {
    case "dot":
    case "air":
      ctx.globalAlpha = p.sp.look === "air" ? 0.55 : 0.95;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "plus":
    case "minus": {
      if (p.s > 0 && p.r > p.sp.r + 1) {
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = c;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      const cr = p.sp.r * 1.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, cr, 0, 6.2832);
      ctx.fill();
      ctx.strokeStyle = pal.dark ? "#101a17" : "#ffffff";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(p.x - cr * 0.5, p.y);
      ctx.lineTo(p.x + cr * 0.5, p.y);
      if (p.sp.look === "plus") {
        ctx.moveTo(p.x, p.y - cr * 0.5);
        ctx.lineTo(p.x, p.y + cr * 0.5);
      }
      ctx.stroke();
      break;
    }
    case "shell": {
      const shelled = p.r > p.sp.r + 1;
      if (shelled) {
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = pal.water;
        ctx.fill();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = pal.water;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sp.r * 1.35, 0, 6.2832);
      ctx.fill();
      break;
    }
    case "cell": {
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r, r * 0.86, p.ang, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = pal.dark ? "#2a0d0d" : "#4a1313";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, r * 0.5, r * 0.4, p.ang, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "blob": {
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * 6.2832 + p.ang + Math.sin(time * 1.2 + i) * 0.1;
        const rr = r * (0.82 + 0.22 * Math.sin(i * 2.3 + p.ang));
        const x = p.x + Math.cos(a) * rr;
        const y = p.y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "pm": {
      const done = p.st === 1;
      ctx.globalAlpha = done ? 1 : 0.9;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 6.2832 + p.ang;
        const rr = r * (0.85 + 0.2 * Math.sin(i * 3.1 + p.ang * 2));
        const x = p.x + Math.cos(a) * rr;
        const y = p.y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case "dimer": {
      const dx = Math.cos(p.ang) * r * 0.6;
      const dy = Math.sin(p.ang) * r * 0.6;
      ctx.beginPath();
      ctx.arc(p.x - dx, p.y - dy, r * 0.62, 0, 6.2832);
      ctx.arc(p.x + dx, p.y + dy, r * 0.62, 0, 6.2832);
      ctx.fill();
      break;
    }
    case "electron": {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 2.4, 0, 6.2832);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 6.2832);
      ctx.fill();
      break;
    }
  }
  if (p.f > 0) {
    ctx.globalAlpha = p.f * 0.5;
    ctx.strokeStyle = c;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 10 * (1 - p.f) + 3, 0, 6.2832);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
