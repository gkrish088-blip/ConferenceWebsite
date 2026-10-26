import React from "react";

export function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = React.useState("");
  const stableIds = sectionIds.join("|");

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const nav = document.querySelector<HTMLElement>(
          "[data-site-navigation]",
        );
        const readingLine =
          window.scrollY +
          (nav?.getBoundingClientRect().height ?? 0) +
          Math.min(120, window.innerHeight * 0.12);
        let currentId = "";

        for (const id of stableIds.split("|")) {
          const section = document.getElementById(id);
          if (!section) continue;
          if (
            section.getBoundingClientRect().top + window.scrollY <=
            readingLine
          )
            currentId = id;
        }

        setActiveId(currentId);
        const hash = window.location.hash;
        const isHospitalityDeepLink =
          currentId === "hospitality" && hash.startsWith("#hospitality-");
        if (currentId && !isHospitalityDeepLink && hash !== `#${currentId}`) {
          window.history.replaceState(null, "", `#${currentId}`);
        }
        if (!currentId && hash && !hash.startsWith("#hospitality-")) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [stableIds]);

  return activeId;
}
