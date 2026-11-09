import { useEffect, useState } from "react";
import "../styles/base.css";
import { registration, site } from "../content";
import { flow } from "../content/flow-example";
import { ContentLink } from "../components/ContentLink";
import { FlowPipeline } from "../components/FlowPipeline";
import { IdentityBand } from "../components/IdentityBand";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNavigation } from "../components/SiteNavigation";
import { sectionRegistry } from "../sections";
import styles from "../styles/flow-example.module.css";

export function FlowExampleApp() {
  const [paused, setPaused] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem("memdesai-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.flowTheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f2f0ea" : "#101a17");
    try {
      localStorage.setItem("memdesai-theme", theme);
    } catch {
      /* The theme still works with storage disabled. */
    }
    document.dispatchEvent(new Event("flow:theme"));
  }, [theme]);

  const themeLabel = theme === "dark" ? flow.lightTheme : flow.darkTheme;
  const motionLabel = paused ? flow.resume : flow.pause;

  return (
    <div className={styles.page} data-interactive data-theme={theme}>
      <a className={styles.skip} href="#main-content">
        {site.accessibility.skipLinkLabel}
      </a>
      <FlowPipeline paused={paused} />
      <IdentityBand />
      <header className={styles.header}>
        <SiteNavigation
          controls={
            <div className={styles.controls}>
              <button
                className={styles.themeToggle}
                type="button"
                aria-label={themeLabel}
                title={themeLabel}
                onClick={() =>
                  setTheme((current) => (current === "dark" ? "light" : "dark"))
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
                onClick={() => setPaused((current) => !current)}
              >
                <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
              </button>
            </div>
          }
        />
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}>
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
              {flow.wordmark[0]} <span>{flow.wordmark[1]}</span>
            </p>
            <h1 id="conference-title">{site.name}</h1>
            <p className={styles.tagline}>{site.tagline}</p>
            <ContentLink
              link={registration.links[0]}
              className={styles.register}
            />
          </div>
        </section>
        {site.nav.map(({ id }) => {
          const Section = sectionRegistry[id];
          return (
            <div key={id}>
              {flow.sectionIds.some((sectionId) => sectionId === id) && (
                <div
                  className={styles.stage}
                  data-flow-node
                  aria-hidden="true"
                />
              )}
              <Section />
            </div>
          );
        })}
      </main>
      <SiteFooter extra={<a href="/countdown/">{flow.countdown}</a>} />
    </div>
  );
}
