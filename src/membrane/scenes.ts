import {
  makeObs,
  type Obs,
  type Pal,
  type Scene,
  type Sp,
  type World,
  type P,
} from "./engine";

export const sceneIds = [
  "ro",
  "electrodialysis",
  "hollow-fibre",
  "gas",
  "fuel-cell",
  "dialysis",
  "air",
  "nanopore",
] as const;
export type SceneId = (typeof sceneIds)[number];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const scale = (W: number, H: number) =>
  Math.min(1, Math.max(0.38, (W * H) / (1300 * 800)));
const cnt = (n: number, k: number) => Math.max(2, Math.round(n * k));

function sp(
  key: string,
  r: number,
  m: number,
  look: Sp["look"],
  col: Sp["col"],
  extra: Partial<Sp> = {},
): Sp {
  return {
    key,
    r,
    m,
    gamma: 2.2,
    sigma: 70 / Math.sqrt(m),
    look,
    col,
    ...extra,
  };
}

/** Column of obstacles on a vertical line. */
function column(
  out: Obs[],
  x: number,
  y0: number,
  y1: number,
  pitch: number,
  r: number,
  off = 0,
  k = 0,
  a = 1,
) {
  for (let y = y0 + off; y <= y1; y += pitch)
    out.push(makeObs(x, y, r + rnd(-0.25, 0.25), k, a));
}

function gapCentre(y: number, pitch: number, off: number) {
  return (Math.round((y - off) / pitch - 0.5) + 0.5) * pitch + off;
}

function slab(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  H: number,
  pal: Pal,
  alpha = 0.1,
) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.5, pal.membrane);
  g.addColorStop(1, "transparent");
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x0, 0, x1 - x0, H);
  ctx.globalAlpha = 1;
}

function tint(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  color: string,
  alpha: number,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------------ */
/* 1. Reverse osmosis desalination                                     */
/* ------------------------------------------------------------------ */
function ro(W: number, H: number): Scene {
  const k = scale(W, H);
  const xm = W > 760 ? W * 0.8 : W * 0.86;
  const pitch = 22;
  const obstacles: Obs[] = [];
  [-16, 0, 16].forEach((dx, i) =>
    column(obstacles, xm + dx, -pitch, H + pitch, pitch, 6.8, i === 1 ? 2 : 0),
  );
  const water = sp("water", 2.4, 1, "dot", (p) => p.water, {
    gamma: 3,
    sigma: 60,
    drive: (w, p) => {
      if (p.x < xm - 30) {
        w.ux = 95;
        w.uy = 25;
        const d = xm - p.x;
        if (d < 90) w.uy += (gapCentre(p.y, pitch, 0) - p.y) * 3 * (1 - d / 90);
      } else if (p.x < xm + 30) {
        w.ux = 95;
        w.uy = (gapCentre(p.y, pitch, 1) - p.y) * 4;
      } else w.ux = 70;
    },
  });
  const ionDrive = (w: World, p: P) => {
    w.ux = p.x < xm ? 22 : 45;
    w.uy = 55;
  };
  const na = sp("na", 3.2, 6, "plus", (p) => p.cation, {
    drive: ionDrive,
    sigma: 40,
  });
  const cl = sp("cl", 3.4, 6, "minus", (p) => p.anion, {
    drive: ionDrive,
    sigma: 40,
  });
  const spawn = (w: World, p: P) => {
    p.x = rnd(14, xm - 40);
    p.y = rnd(0, w.H);
    if (p.sp !== water) {
      p.r = 5;
      p.s = 1;
    }
  };
  return {
    species: [water, na, cl],
    counts: [cnt(190, k), cnt(30, k), cnt(30, k)],
    obstacles,
    spawn,
    edge(w, p) {
      if (p.y < 0) p.y += w.H;
      else if (p.y > w.H) p.y -= w.H;
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > w.W + 6) {
        w.respawn(p);
        return true;
      }
      return false;
    },
    side: (p) => (p.x > xm + 14 ? 1 : 0),
    paintBack(w, ctx, pal) {
      tint(ctx, 0, xm - 20, 0, w.H, pal.cation, 0.045);
      tint(ctx, xm + 20, w.W, 0, w.H, pal.water, 0.05);
      slab(ctx, xm - 40, xm + 40, w.H, pal, 0.13);
      ctx.strokeStyle = pal.river;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const x = 26 + i * 22 + ((w.time * 30) % 22);
        if (x > xm - 90) continue;
        ctx.beginPath();
        ctx.moveTo(x, w.H * 0.5 - 9);
        ctx.lineTo(x + 8, w.H * 0.5);
        ctx.lineTo(x, w.H * 0.5 + 9);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 2. Electrodialysis / critical-mineral recovery                      */
/* ------------------------------------------------------------------ */
function electrodialysis(W: number, H: number): Scene {
  const k = scale(W, H);
  const x1 = W * (W > 760 ? 0.44 : 0.3);
  const x2 = W * (W > 760 ? 0.72 : 0.7);
  const pitch = 20;
  const obstacles: Obs[] = [];
  [x1, x2].forEach((x) => {
    column(obstacles, x - 6, -pitch, H + pitch, pitch, 6);
    column(obstacles, x + 6, -pitch, H + pitch, pitch, 6, 1);
  });
  const near = (x: number, xm: number) => Math.abs(x - xm) < 26;
  const cationDrive = (w: World, p: P) => {
    w.ux = 70;
    w.uy = 26;
    // Donnan exclusion: the anion-exchange membrane repels cations.
    if (near(p.x, x1)) w.ux = 260 * Math.sign(p.x - x1 || 1);
    // funnel into pores of the cation-exchange membrane
    if (Math.abs(p.x - x2) < 60) w.uy += (gapCentre(p.y, pitch, 0.5) - p.y) * 3;
  };
  const anionDrive = (w: World, p: P) => {
    w.ux = -70;
    w.uy = 26;
    if (near(p.x, x2)) w.ux = 260 * Math.sign(p.x - x2 || 1);
    if (Math.abs(p.x - x1) < 60) w.uy += (gapCentre(p.y, pitch, 0.5) - p.y) * 3;
  };
  const na = sp("na", 3.4, 6, "plus", (p) => p.cation, {
    drive: cationDrive,
    sigma: 38,
  });
  const li = sp("li", 3, 3, "plus", (p) => p.marigold, {
    drive: cationDrive,
    sigma: 46,
  });
  const cl = sp("cl", 3.6, 6, "minus", (p) => p.anion, {
    drive: anionDrive,
    sigma: 38,
  });
  const feed = (w: World, p: P, top = false) => {
    p.x = rnd(x1 + 22, x2 - 22);
    p.y = top ? rnd(-30, 0) : rnd(0, w.H);
  };
  return {
    species: [na, li, cl],
    counts: [cnt(46, k), cnt(16, k), cnt(66, k)],
    obstacles,
    spawn: (w, p) => feed(w, p, w.time > 0.1),
    edge(w, p) {
      if (p.y < -24) {
        p.y = -24;
        p.vy = Math.abs(p.vy);
      }
      if (p.x < 22 || p.x > w.W - 22 || p.y > w.H + 8) {
        feed(w, p, true);
        p.f = 0;
        return true;
      }
      return false;
    },
    side: (p) =>
      p.sp.key === "cl" ? (p.x < x1 - 8 ? 1 : 0) : p.x > x2 + 8 ? 1 : 0,
    paintBack(w, ctx, pal) {
      tint(ctx, x1, x2, 0, w.H, pal.water, 0.05);
      tint(ctx, 0, x1, 0, w.H, pal.anion, 0.03);
      tint(ctx, x2, w.W, 0, w.H, pal.cation, 0.04);
      slab(ctx, x1 - 24, x1 + 24, w.H, pal, 0.1);
      slab(ctx, x2 - 24, x2 + 24, w.H, pal, 0.1);
      // electrodes
      ctx.lineWidth = 3;
      ctx.strokeStyle = pal.marigold;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(14, w.H);
      ctx.stroke();
      ctx.strokeStyle = pal.river;
      ctx.beginPath();
      ctx.moveTo(w.W - 14, 0);
      ctx.lineTo(w.W - 14, w.H);
      ctx.stroke();
      // fixed charges on the membranes
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.5;
      for (let y = 10; y < w.H; y += pitch * 2) {
        ctx.strokeStyle = pal.anion;
        ctx.beginPath();
        ctx.moveTo(x1 - 17, y);
        ctx.lineTo(x1 - 12, y);
        ctx.moveTo(x1 - 14.5, y - 2.5);
        ctx.lineTo(x1 - 14.5, y + 2.5);
        ctx.stroke();
        ctx.strokeStyle = pal.cation;
        ctx.beginPath();
        ctx.moveTo(x2 + 12, y);
        ctx.lineTo(x2 + 17, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 3. Hollow-fibre filtration with AI-triggered backwash               */
/* ------------------------------------------------------------------ */
function hollowFibre(W: number, H: number): Scene {
  const k = scale(W, H);
  const n = H > 640 ? 3 : 2;
  const half = 34;
  const lumens = Array.from({ length: n }, (_, i) => (H * (i + 0.5)) / n);
  const pitch = 20;
  const obstacles: Obs[] = [];
  lumens.forEach((cy) => {
    [-1, 1].forEach((s) => {
      for (const d of [0, 11]) {
        for (let x = -pitch; x <= W + pitch; x += pitch)
          obstacles.push(
            makeObs(x + 10, cy + s * (half + d), 5.4 + rnd(-0.2, 0.2), 0, 0.8),
          );
      }
    });
  });
  const lumenOf = (y: number) => {
    for (let i = 0; i < n; i++)
      if (Math.abs(y - lumens[i]) < half - 3) return i;
    return -1;
  };
  const nearest = (y: number) =>
    lumens.reduce(
      (b, c) => (Math.abs(c - y) < Math.abs(b - y) ? c : b),
      lumens[0],
    );
  const water = sp("water", 2.4, 1, "dot", (p) => p.water, {
    gamma: 3,
    sigma: 55,
    drive: (w, p) => {
      const cy = nearest(p.y);
      if (Math.abs(p.y - cy) < half + 16) {
        w.ux = 75;
        w.uy = Math.sign(p.y - cy || 1) * 34;
        if (Math.abs(p.y - cy) > half - 10)
          w.ux = (Math.round((p.x - 10) / pitch) * pitch + 10 - p.x) * 4;
      } else {
        w.ux = 28;
        w.uy = 0;
      }
    },
  });
  const foul = sp("foul", 6, 12, "blob", (p) => p.foul, {
    sigma: 22,
    stick: true,
    drive: (w, p) => {
      const cy = nearest(p.y);
      w.ux = 70;
      w.uy = (p.y - cy) * 0.5;
    },
  });
  let backwash = 0;
  let nextCheck = 6;
  return {
    species: [water, foul],
    counts: [cnt(170, k), cnt(16, k)],
    obstacles,
    spawn(w, p) {
      const cy = lumens[Math.floor(Math.random() * n)];
      const inLumen = p.sp === foul || Math.random() < 0.55;
      p.x = rnd(10, w.W);
      p.y = inLumen
        ? cy + rnd(-half + 8, half - 8)
        : cy + rnd(half + 20, half + 60);
      if (!inLumen && Math.abs(p.y - nearest(p.y)) < half + 20)
        p.y = cy + half + 50;
    },
    edge(w, p) {
      if (p.x > w.W + 6) {
        if (p.sp === water && lumenOf(p.y) < 0 && Math.random() < 0.0)
          return false;
        const cy = lumens[Math.floor(Math.random() * n)];
        p.x = -4;
        p.y = cy + rnd(-half + 8, half - 8);
        p.st = 0;
        p.vx = 40;
        return true;
      }
      if (p.x < 0) p.x = 0;
      if (p.y < p.r) {
        p.y = p.r;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > w.H - p.r) {
        p.y = w.H - p.r;
        p.vy = -Math.abs(p.vy);
      }
      return false;
    },
    side: (p) => (lumenOf(p.y) < 0 ? 1 : 0),
    tick(w, dt) {
      if (backwash > 0) backwash = Math.max(0, backwash - dt);
      if (w.time > nextCheck) {
        const stuck = w.ps.filter((q) => q.sp === foul && q.st === 1).length;
        if (stuck >= Math.max(4, Math.round(foul ? 6 * k : 4))) {
          backwash = 1.6;
          for (const q of w.ps) {
            if (q.sp === foul && q.st === 1) {
              q.st = 0;
              q.f = 1;
              const cy = nearest(q.y);
              q.vy = (cy - q.y) * 2.2;
              q.vx = 20;
            }
          }
        }
        nextCheck = w.time + 5;
      }
    },
    paintBack(w, ctx, pal) {
      lumens.forEach((cy) => {
        tint(ctx, 0, w.W, cy - half, cy + half, pal.water, 0.05);
        const flash = backwash / 1.6;
        if (flash > 0) {
          ctx.globalAlpha = flash * 0.5;
          ctx.strokeStyle = pal.river;
          ctx.lineWidth = 3;
          const sx = w.W * (1 - flash);
          ctx.beginPath();
          ctx.moveTo(sx, cy - half - 6);
          ctx.lineTo(sx, cy + half + 6);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = pal.membrane;
        ctx.fillRect(0, cy - half - 18, w.W, 36 - 0);
        ctx.fillRect(0, cy + half - 18, w.W, 36);
        ctx.globalAlpha = 1;
      });
    },
  };
}

/* ------------------------------------------------------------------ */
/* 4. Gas separation (mixed-matrix membrane)                           */
/* ------------------------------------------------------------------ */
function gas(W: number, H: number): Scene {
  const k = scale(W, H);
  const xm = W > 760 ? W * 0.62 : W * 0.5;
  const pitch = 20;
  const obstacles: Obs[] = [];
  [-14, 0, 14].forEach((dx, i) =>
    column(
      obstacles,
      xm + dx,
      -pitch,
      H + pitch,
      pitch,
      6.5,
      i === 1 ? 2 : 0,
      0,
      0.9,
    ),
  );
  const fillers = Array.from({ length: Math.round(H / 130) }, (_, i) => ({
    x: xm + rnd(-8, 8),
    y: (i + 0.5) * 130 + rnd(-20, 20),
  }));
  const gasDrive = (selective: boolean) => (w: World, p: P) => {
    w.ux = p.x < xm - 24 ? 28 : p.x < xm + 24 ? 60 : 55;
    w.uy = 0;
    if (selective && Math.abs(p.x - xm) < 70) {
      const d = Math.abs(p.x - xm);
      w.uy = (gapCentre(p.y, pitch, 0) - p.y) * 3 * (1 - d / 70);
    }
  };
  const base = { gamma: 1.2, sigma: 85 };
  const co2 = sp("co2", 2.9, 4, "dimer", (p) => p.cation, {
    ...base,
    drive: gasDrive(true),
  });
  const n2 = sp("n2", 4.4, 4, "dot", (p) => p.water, {
    ...base,
    drive: gasDrive(false),
  });
  const ch4 = sp("ch4", 4.8, 3, "dot", (p) => p.foul, {
    ...base,
    drive: gasDrive(false),
  });
  return {
    species: [co2, n2, ch4],
    counts: [cnt(60, k), cnt(60, k), cnt(40, k)],
    obstacles,
    spawn(w, p) {
      p.x = rnd(12, xm - 40);
      p.y = rnd(0, w.H);
    },
    edge(w, p) {
      if (p.y < p.r) {
        p.y = p.r;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > w.H - p.r) {
        p.y = w.H - p.r;
        p.vy = -Math.abs(p.vy);
      }
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > w.W - 14) {
        w.respawn(p);
        return true;
      }
      return false;
    },
    side: (p) => (p.x > xm + 14 ? 1 : 0),
    paintBack(w, ctx, pal) {
      tint(ctx, 0, xm - 20, 0, w.H, pal.foul, 0.05);
      slab(ctx, xm - 36, xm + 36, w.H, pal, 0.1);
      ctx.strokeStyle = pal.marigold;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      for (const f of fillers) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 21, 0, 6.2832);
        ctx.stroke();
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = pal.marigold;
        ctx.fill();
        ctx.globalAlpha = 0.4;
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 5. PEM fuel cell                                                    */
/* ------------------------------------------------------------------ */
function fuelCell(W: number, H: number): Scene {
  const k = scale(W, H);
  const xm = W > 760 ? W * 0.6 : W * 0.5;
  const xa = xm - 62;
  const xc = xm + 62;
  const pitch = 22;
  const top = H > 700 ? 310 : Math.max(90, H * 0.14);
  const wire: [number, number][] = [
    [xa - 46, 0],
    [xa - 46, top],
    [xc + 46, top],
    [xc + 46, 0],
  ];
  const segLen = [0, 1, 2].map((i) =>
    Math.hypot(wire[i + 1][0] - wire[i][0], wire[i + 1][1] - wire[i][1]),
  );
  const total = segLen.reduce((a, b) => a + b, 0);
  const pointAt = (s: number): [number, number] => {
    let r = s;
    for (let i = 0; i < 3; i++) {
      if (r <= segLen[i]) {
        const t = r / segLen[i];
        return [
          wire[i][0] + (wire[i + 1][0] - wire[i][0]) * t,
          wire[i][1] + (wire[i + 1][1] - wire[i][1]) * t,
        ];
      }
      r -= segLen[i];
    }
    return wire[3];
  };
  const obstacles: Obs[] = [];
  [-16, 0, 16].forEach((dx, i) =>
    column(obstacles, xm + dx, -pitch, H + pitch, pitch, 7, i === 1 ? 2 : 0),
  );
  const h2: Sp = sp("h2", 4.2, 2, "dimer", (p) => p.water, {
    sigma: 60,
    drive: (w) => {
      w.ux = 38;
      w.uy = 12;
    },
  });
  const hp: Sp = sp("hplus", 2.4, 1, "plus", (p) => p.marigold, {
    sigma: 40,
    drive: (w, p) => {
      w.ux = p.x < xm + 30 ? 90 : 60;
      if (Math.abs(p.x - xm) < 60) w.uy = (gapCentre(p.y, pitch, 0) - p.y) * 3;
    },
  });
  const el: Sp = sp("e", 1.8, 1, "electron", (p) => p.anion, {
    sigma: 0,
    gamma: 1,
    ghost: true,
  });
  const o2: Sp = sp("o2", 4.2, 3, "dimer", (p) => p.cation, {
    sigma: 55,
    drive: (w) => {
      w.ux = -38;
      w.uy = -12;
    },
  });
  const h2o: Sp = sp("h2o", 3.2, 2, "dot", (p) => p.water, {
    sigma: 40,
    drive: (w) => {
      w.ux = 70;
      w.uy = 0;
    },
  });
  const addH2 = (w: World) => w.add(h2);
  return {
    species: [h2, hp, el, o2, h2o],
    counts: [cnt(46, k), 0, 0, cnt(34, k), 0],
    obstacles,
    spawn(w, p) {
      if (p.sp === h2) {
        p.x = rnd(14, xa - 14);
        p.y = rnd(top + 20, w.H);
      } else if (p.sp === o2) {
        p.x = rnd(xc + 14, w.W - 14);
        p.y = rnd(top + 20, w.H);
      } else if (p.sp === el) {
        p.s = 0;
        [p.x, p.y] = pointAt(0);
      }
    },
    edge(w, p) {
      if (p.sp === el) {
        p.s += 150 / 60;
        if (p.s >= total) {
          w.kill(p);
          return true;
        }
        [p.x, p.y] = pointAt(p.s);
        return true;
      }
      if (p.y < top + 8 && p.sp !== h2o) {
        p.y = top + 8;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > w.H - p.r) {
        p.y = w.H - p.r;
        p.vy = -Math.abs(p.vy);
      }
      if (p.sp === h2o && p.x > w.W + 6) {
        w.kill(p);
        return true;
      }
      if (p.sp === h2o && p.y < p.r) {
        p.y = p.r;
        p.vy = Math.abs(p.vy);
      }
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx);
      }
      if (p.sp === o2 && p.x > w.W - p.r) {
        p.x = w.W - p.r;
        p.vx = -Math.abs(p.vx);
      }
      if (p.sp === h2 && p.x > xa + 2 && p.x < xm - 40 && Math.random() < 0.0)
        return false;
      return false;
    },
    update(w, p) {
      if (p.sp === h2 && p.x > xa - 4 && p.x < xa + 30) {
        // oxidation at the anode catalyst: H2 -> 2 H+ + 2 e-
        p.sp = hp;
        p.r = hp.r;
        p.f = 1;
        p.x = xa + 8;
        const q = w.add(hp);
        q.x = xa + 8;
        q.y = p.y + rnd(-6, 6);
        q.f = 1;
        for (let i = 0; i < 2; i++) {
          const e = w.add(el);
          e.s = -i * 22;
        }
        addH2(w);
      } else if (p.sp === hp && p.x > xc - 6) {
        // reduction at the cathode catalyst: H+ + O2 -> H2O
        p.sp = h2o;
        p.r = h2o.r;
        p.f = 1;
        p.x = xc + 6;
        const o = w.ps.find((q) => q.sp === o2);
        if (o) {
          w.respawn(o);
          o.f = 1;
        }
      } else if (p.sp === o2 && p.x < xc + 8) {
        p.x = xc + 8;
        p.vx = Math.abs(p.vx);
      } else if (p.sp === h2o && p.x < xc + 4) {
        p.x = xc + 4;
        p.vx = Math.abs(p.vx);
      }
      if (p.sp === el && p.s < 0) {
        p.x = wire[0][0];
        p.y = 0;
      }
      return true;
    },
    side: (p) => (p.sp === hp && p.x > xm + 6 ? 1 : 0),
    paintBack(w, ctx, pal) {
      tint(ctx, xa - 22, xa + 2, 0, w.H, pal.ink, 0.1);
      tint(ctx, xc - 2, xc + 22, 0, w.H, pal.ink, 0.1);
      slab(ctx, xm - 46, xm + 46, w.H, pal, 0.12);
      ctx.fillStyle = pal.river;
      ctx.globalAlpha = 0.7;
      for (let y = 8; y < w.H; y += 16) {
        ctx.beginPath();
        ctx.arc(xa, y, 2.6, 0, 6.2832);
        ctx.arc(xc, y, 2.6, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = pal.silt;
      ctx.lineWidth = 2;
      ctx.beginPath();
      wire.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      // load symbol
      const mx = xm;
      ctx.clearRect(0, 0, 0, 0);
      ctx.fillStyle = pal.bg;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(mx - 26, top - 8, 52, 16);
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(mx - 26, top);
      for (let i = 0; i < 6; i++)
        ctx.lineTo(mx - 22 + i * 8.8, top + (i % 2 ? 7 : -7));
      ctx.lineTo(mx + 26, top);
      ctx.stroke();
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 6. Haemodialysis (biomedical)                                       */
/* ------------------------------------------------------------------ */
function dialysis(W: number, H: number): Scene {
  const k = scale(W, H);
  const xm = W > 760 ? W * 0.6 : W * 0.5;
  const pitch = 26;
  const obstacles: Obs[] = [];
  [-9, 9].forEach((dx, i) =>
    column(
      obstacles,
      xm + dx,
      -pitch,
      H + pitch,
      pitch,
      9.2,
      0,
      0,
      0.9 + i * 0,
    ),
  );
  const urea = sp("urea", 3, 3, "dot", (p) => p.foul, {
    sigma: 60,
    drive: (w, p) => {
      if (p.x < xm) {
        w.uy = 40;
        w.ux = Math.abs(p.x - xm) < 130 ? 40 : 8;
        if (Math.abs(p.x - xm) < 60)
          w.uy += (gapCentre(p.y, pitch, 0) - p.y) * 2.5;
      } else {
        w.uy = -50;
        w.ux = 30;
        if (Math.abs(p.x - xm) < 60)
          w.uy += (gapCentre(p.y, pitch, 0) - p.y) * 2.5;
      }
    },
  });
  const alb = sp("albumin", 8.5, 40, "blob", (p) => p.marigold, {
    sigma: 28,
    drive: (w) => {
      w.uy = 40;
      w.ux = 0;
    },
  });
  const rbc = sp("rbc", 15, 120, "cell", () => "#b4443d", {
    sigma: 14,
    gamma: 1.6,
    drive: (w) => {
      w.uy = 40;
      w.ux = 0;
    },
  });
  const spawnBlood = (w: World, p: P, top: boolean) => {
    p.x = rnd(p.r + 8, xm - 80);
    p.y = top ? rnd(-30, 0) : rnd(0, w.H);
  };
  return {
    species: [rbc, alb, urea],
    counts: [cnt(9, k), cnt(16, k), cnt(80, k)],
    obstacles,
    spawn: (w, p) => spawnBlood(w, p, w.time > 0.1),
    edge(w, p) {
      const dialysate = p.x > xm;
      if (!dialysate && p.y < -24) {
        p.y = -24;
        p.vy = Math.abs(p.vy);
      }
      if (dialysate && p.y < -6) {
        spawnBlood(w, p, true);
        return true;
      }
      if (!dialysate && p.y > w.H + 20) {
        if (p.sp === urea && Math.random() < 0.4) {
          // cleaned blood returns with less urea
          p.y = -10;
          return true;
        }
        spawnBlood(w, p, true);
        return true;
      }
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > w.W - p.r) {
        p.x = w.W - p.r;
        p.vx = -Math.abs(p.vx);
      }
      if (p.sp.key !== "urea" && p.x > xm - p.r - 12 - 0 && p.x < xm) {
        // (collision handles this; guard against numerical tunnelling)
      }
      return false;
    },
    side: (p) => (p.x > xm + 10 ? 1 : 0),
    paintBack(w, ctx, pal) {
      tint(ctx, 0, xm - 14, 0, w.H, "#b4443d", pal.dark ? 0.06 : 0.07);
      tint(ctx, xm + 14, w.W, 0, w.H, pal.water, 0.05);
      slab(ctx, xm - 30, xm + 30, w.H, pal, 0.12);
      ctx.strokeStyle = pal.river;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const y = 40 + i * 24 + ((w.time * 30) % 24);
        ctx.beginPath();
        ctx.moveTo(xm - 130, y);
        ctx.lineTo(xm - 130 + 9, y + 8);
        ctx.lineTo(xm - 130 + 18, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xm + 130, w.H - y);
        ctx.lineTo(xm + 130 + 9, w.H - y - 8);
        ctx.lineTo(xm + 130 + 18, w.H - y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 7. Air purification (fibrous filter)                                */
/* ------------------------------------------------------------------ */
function air(W: number, H: number): Scene {
  const k = scale(W, H);
  const xm = W > 760 ? W * 0.62 : W * 0.5;
  const halfBand = 85;
  const obstacles: Obs[] = [];
  const nf = Math.round(34 * Math.max(0.55, Math.min(1.2, H / 800)));
  for (let i = 0; i < nf; i++) {
    const cx = xm + rnd(-halfBand, halfBand);
    const cy = rnd(0, H);
    const ang = rnd(0, Math.PI);
    const len = rnd(90, 160);
    for (let t = -len / 2; t <= len / 2; t += 3.2)
      obstacles.push(
        makeObs(cx + Math.cos(ang) * t, cy + Math.sin(ang) * t, 2.6, 2, 0.3),
      );
  }
  const air = sp("air", 1.7, 0.5, "air", (p) => p.water, {
    gamma: 2.4,
    sigma: 120,
    ghost: true,
    drive: (w) => {
      w.ux = 100;
      w.uy = 0;
    },
  });
  const pm = sp("pm25", 5.2, 12, "pm", (p) => p.foul, {
    sigma: 18,
    stick: true,
    drive: (w) => {
      w.ux = 95;
      w.uy = 0;
    },
  });
  const pollen = sp("pollen", 9, 40, "pm", (p) => p.marigold, {
    sigma: 10,
    stick: true,
    drive: (w) => {
      w.ux = 90;
      w.uy = 0;
    },
  });
  return {
    species: [air, pm, pollen],
    counts: [cnt(150, k), cnt(30, k), cnt(8, k)],
    obstacles,
    spawn(w, p) {
      p.x = w.time < 0.1 ? rnd(8, xm - halfBand - 10) : rnd(-20, 0);
      p.y = rnd(0, w.H);
    },
    edge(w, p) {
      if (p.y < 0) p.y += w.H;
      else if (p.y > w.H) p.y -= w.H;
      if (p.x > w.W + 6) {
        w.respawn(p);
        return true;
      }
      if (p.x < 0 && p.vx < 0) p.vx = Math.abs(p.vx);
      return false;
    },
    update(w, p) {
      if (p.st === 1 && p.sp.stick && w.time - p.t > 9 + (p.x % 5)) {
        p.f = 1;
        return false;
      }
      return true;
    },
    side: (p) => (p.x > xm + halfBand + 6 ? 1 : 0),
    paintBack(w, ctx, pal) {
      slab(ctx, xm - halfBand - 20, xm + halfBand + 20, w.H, pal, 0.07);
      ctx.strokeStyle = pal.river;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const x = 20 + i * 22 + ((w.time * 30) % 22);
        if (x > xm - halfBand - 40) continue;
        ctx.beginPath();
        ctx.moveTo(x, w.H * 0.5 - 9);
        ctx.lineTo(x + 8, w.H * 0.5);
        ctx.lineTo(x, w.H * 0.5 + 9);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 8. Single nanopore: hydration-shell shedding                        */
/* ------------------------------------------------------------------ */
function nanopore(W: number, H: number): Scene {
  const k = scale(W, H);
  const xm = W > 760 ? W * 0.6 : W * 0.5;
  const R = 17;
  const throat = 15;
  const pores = H > 600 ? [H * 0.2, H * 0.5, H * 0.8] : [H * 0.5];
  const obstacles: Obs[] = [];
  [-18, 18].forEach((dx) => {
    for (let y = -R; y <= H + R; y += 30) {
      const near = pores.some((c) => Math.abs(y - c) < throat / 2 + R - 1);
      if (!near) obstacles.push(makeObs(xm + dx, y, R, 0, 0.8));
    }
    pores.forEach((c) => {
      obstacles.push(makeObs(xm + dx, c - throat / 2 - R, R, 0, 0.8));
      obstacles.push(makeObs(xm + dx, c + throat / 2 + R, R, 0, 0.8));
    });
  });
  const poreY = (y: number) =>
    pores.reduce(
      (b, c) => (Math.abs(c - y) < Math.abs(b - y) ? c : b),
      pores[0],
    );
  const funnel = (w: World, p: P, strength: number) => {
    const d = Math.abs(p.x - xm);
    if (d < 150) w.uy = (poreY(p.y) - p.y) * strength * (1 - d / 150);
  };
  const water = sp("water", 2.6, 1, "dot", (p) => p.water, {
    sigma: 60,
    drive: (w, p) => {
      w.ux = p.x < xm ? 62 : 50;
      w.uy = 0;
      funnel(w, p, 8);
    },
  });
  const ionDrive = (w: World, p: P) => {
    w.ux = p.x < xm ? 48 : 40;
    w.uy = 0;
    funnel(w, p, 3.2);
  };
  const na = sp("na", 4.2, 8, "shell", (p) => p.cation, {
    sigma: 30,
    drive: (w, p) => {
      ionDrive(w, p);
      // strongly hydrated Na+ is turned away at the pore mouth
      if (p.x < xm && xm - p.x < 46)
        w.uy = Math.sign(p.y - poreY(p.y) || 1) * 40;
    },
  });
  const kk = sp("k", 4.6, 8, "shell", (p) => p.anion, {
    sigma: 30,
    drive: ionDrive,
  });
  return {
    species: [water, na, kk],
    counts: [cnt(120, k), cnt(16, k), cnt(16, k)],
    obstacles,
    spawn(w, p) {
      p.x = rnd(14, xm - 60);
      p.y = rnd(0, w.H);
      if (p.sp !== water) {
        p.r = p.sp === na ? 11 : 9;
        p.s = 1;
      }
    },
    edge(w, p) {
      if (p.y < p.r) {
        p.y = p.r;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > w.H - p.r) {
        p.y = w.H - p.r;
        p.vy = -Math.abs(p.vy);
      }
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > w.W + 6) {
        w.respawn(p);
        return true;
      }
      return false;
    },
    update(_w, p) {
      if (p.sp === kk) {
        const inPore =
          Math.abs(p.x - xm) < 56 && Math.abs(p.y - poreY(p.y)) < 34;
        if (inPore && p.r > kk.r + 0.5) {
          p.r = Math.max(kk.r, p.r - 0.6);
          p.f = 0.8;
        } else if (!inPore && Math.abs(p.x - xm) > 52 && p.r < 9) {
          p.r = Math.min(9, p.r + 0.12);
        }
      }
      return true;
    },
    side: (p) => (p.x > xm + 20 ? 1 : 0),
    paintBack(w, ctx, pal) {
      tint(ctx, 0, xm - 30, 0, w.H, pal.cation, 0.035);
      tint(ctx, xm + 30, w.W, 0, w.H, pal.water, 0.05);
      slab(ctx, xm - 50, xm + 50, w.H, pal, 0.1);
    },
  };
}

const builders: Record<SceneId, (W: number, H: number) => Scene> = {
  ro,
  electrodialysis,
  "hollow-fibre": hollowFibre,
  gas,
  "fuel-cell": fuelCell,
  dialysis,
  air,
  nanopore,
};

export function buildScene(id: SceneId, W: number, H: number): Scene {
  return builders[id](W, H);
}

/** Species (key, colour) used by the legend. */
export function speciesOf(scene: Scene) {
  return scene.species.map((s) => ({ key: s.key, col: s.col }));
}
