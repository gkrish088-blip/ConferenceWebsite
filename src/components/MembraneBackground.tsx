import { useEffect, useRef } from "react";
import { World, type Pal } from "../membrane/engine";
import { buildScene, type SceneId } from "../membrane/scenes";
import { setStats } from "../membrane/stats";
import styles from "../styles/membrane-site.module.css";

type Theme = "dark" | "light";

const accents: Record<
  Theme,
  Pick<Pal, "water" | "cation" | "anion" | "foul">
> = {
  dark: {
    water: "#7cc3da",
    cation: "#e3a86a",
    anion: "#8fd39b",
    foul: "#c98d6b",
  },
  light: {
    water: "#2b7a96",
    cation: "#a2602b",
    anion: "#2f7f4b",
    foul: "#8a4f35",
  },
};

function readPalette(el: HTMLElement, theme: Theme): Pal {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    dark: theme === "dark",
    bg: v("--page-background"),
    ink: v("--ink"),
    silt: v("--silt"),
    river: v("--river"),
    marigold: v("--marigold"),
    membrane: v("--river"),
    ...accents[theme],
  };
}

export function MembraneBackground({
  scene,
  theme,
  paused,
}: {
  scene: SceneId;
  theme: Theme;
  paused: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const themeRef = useRef(theme);
  pausedRef.current = paused;
  themeRef.current = theme;
  const redrawRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    let world: World | null = null;
    let raf = 0;
    let last = 0;
    let statsAt = 0;
    let width = 0;
    let height = 0;
    let pal = readPalette(canvas, themeRef.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = () => {
      if (!world) return;
      ctx.clearRect(0, 0, width, height);
      world.draw(ctx, pal);
    };
    redrawRef.current = () => {
      pal = readPalette(canvas, themeRef.current);
      draw();
      publish();
    };

    const publish = () => {
      if (!world) return;
      setStats({
        scene,
        items: world.scene.species.map((s) => ({
          key: s.key,
          color: s.col(pal),
          count: world!.crossed[s.key] ?? 0,
        })),
      });
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(320, rect.height);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pal = readPalette(canvas, themeRef.current);
      world = new World(width, height, buildScene(scene, width, height));
      const warm = reduce.matches ? 900 : 150;
      for (let i = 0; i < warm; i++) world.step(1 / 60);
      draw();
      publish();
    };

    const frame = (now: number) => {
      raf = window.requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      if (!world || pausedRef.current || document.hidden) return;
      const sub = dt > 0.026 ? 2 : 1;
      for (let i = 0; i < sub; i++) world.step(dt / sub);
      draw();
      if (now - statsAt > 500) {
        statsAt = now;
        publish();
      }
    };

    build();
    raf = window.requestAnimationFrame(frame);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const rect = canvas.getBoundingClientRect();
        const heightChange = Math.abs(rect.height - height) / height;
        if (Math.abs(rect.width - width) > 2 || heightChange > 0.25) build();
      }, 220);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      redrawRef.current = () => undefined;
    };
  }, [scene]);

  useEffect(() => {
    redrawRef.current();
  }, [theme]);

  return (
    <canvas
      key={scene}
      ref={canvasRef}
      className={styles.membrane}
      aria-hidden="true"
      data-membrane-scene={scene}
    />
  );
}
