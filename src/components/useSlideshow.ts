import { useEffect, useRef, useState } from "react";

export function useSlideshow(count: number, intervalMs = 7000) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReduced(query.matches);
      setPlaying(!query.matches);
    };
    update();
    query.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    if (!playing || engaged || !visible || reduced) return;
    const tick = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(tick);
  }, [count, intervalMs, playing, engaged, visible, reduced]);
  const step = (delta: number) => {
    setPlaying(false);
    setIndex((i) => (i + delta + count) % count);
  };
  return {
    ref,
    index,
    playing,
    reduced,
    step,
    toggle: () => setPlaying((p) => !p),
    interaction: {
      onMouseEnter: () => setEngaged(true),
      onMouseLeave: () => setEngaged(false),
      onFocusCapture: () => setEngaged(true),
      onBlurCapture: (event: React.FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setEngaged(false);
      },
    },
  };
}
