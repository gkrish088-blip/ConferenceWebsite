import { useEffect, useState } from "react";
import "../styles/base.css";
import { registration, site } from "../content";
import { membranes } from "../content/membranes";
import { ContentLink } from "../components/ContentLink";
import { IdentityBand } from "../components/IdentityBand";
import { MembraneBackground } from "../components/MembraneBackground";
import { MembraneCaption } from "../components/MembraneCaption";
import { PageNavigation } from "../components/PageNavigation";
import { Pager } from "../components/Pager";
import { SiteFooter } from "../components/SiteFooter";
import { sectionRegistry } from "../sections";
import { usePage } from "./router";
import styles from "../styles/membrane-site.module.css";

type Theme = "dark" | "light";
const themeColor: Record<Theme, string> = {
  dark: "#101a17",
  light: "#dcd8ca",
};

export function MembraneSiteApp({
  initialPath = "/",
}: {
  initialPath?: string;
}) {
  const { page, navigate } = usePage(initialPath);
  const [paused, setPaused] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("memdesai-theme");
      if (saved === "dark") setTheme("dark");
    } catch {
      /* Optional storage. */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.flowTheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColor[theme]);
    try {
      localStorage.setItem("memdesai-theme", theme);
    } catch {
      /* The theme still works with storage disabled. */
    }
  }, [theme]);

  const entry = membranes.pages.find((item) => item.id === page)!;
  const label = site.nav.find((item) => item.id === page)?.label ?? "";
  const Section = sectionRegistry[page];
  const home = page === "about";

  useEffect(() => {
    document.title = home ? site.shortName : `${label} · ${site.shortName}`;
  }, [home, label]);

  const themeLabel =
    theme === "dark" ? membranes.ui.lightTheme : membranes.ui.darkTheme;
  const motionLabel = paused ? membranes.ui.resume : membranes.ui.pause;

  return (
    <div
      className={styles.page}
      data-interactive
      data-theme={theme}
      data-page={page}
    >
      <a className={styles.skip} href="#main-content">
        {site.accessibility.skipLinkLabel}
      </a>
      <MembraneBackground scene={entry.scene} theme={theme} paused={paused} />
      <IdentityBand />
      <header className={styles.header}>
        <PageNavigation
          current={page}
          onNavigate={navigate}
          controls={
            <div className={styles.controls}>
              <button
                className={styles.themeToggle}
                type="button"
                aria-label={themeLabel}
                title={themeLabel}
                onClick={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden="true"
                >
                  {theme === "dark" ? (
                    <>
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
                    </>
                  ) : (
                    <path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z" />
                  )}
                </svg>
              </button>
              <button
                className={styles.motionToggle}
                type="button"
                aria-pressed={paused}
                aria-label={motionLabel}
                title={motionLabel}
                onClick={() => setPaused((p) => !p)}
              >
                <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
              </button>
            </div>
          }
        />
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        {home ? (
          <section
            className={styles.hero}
            data-flow-hero
            aria-labelledby="conference-title"
          >
            <div className={styles.heroDetails}>
              <p>{site.datesText}</p>
              <p>{site.venue}</p>
            </div>
            <div className={styles.heroCopy}>
              <p className={styles.wordmark} aria-hidden="true">
                {membranes.ui.wordmark[0]}{" "}
                <span>{membranes.ui.wordmark[1]}</span>
              </p>
              <h1 id="conference-title">{site.name}</h1>
              <p className={styles.tagline}>{site.tagline}</p>
              <ContentLink
                link={registration.links[0]}
                className={styles.register}
              />
            </div>
          </section>
        ) : (
          <>
            <h1 className="sr-only">{site.name}</h1>
            <div className={styles.stage} data-stage />
          </>
        )}
        <div className={styles.captionRow}>
          <MembraneCaption page={entry} />
        </div>
        <div className={styles.panel} key={page} data-panel>
          <Section />
        </div>
        <Pager current={page} onNavigate={navigate} />
      </main>
      <SiteFooter extra={<a href="/countdown/">{membranes.ui.countdown}</a>} />
    </div>
  );
}
