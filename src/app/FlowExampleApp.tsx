import { useEffect, useState } from "react";
import "../styles/tokens.css";
import { about, site, themes } from "../content";
import { IdentityBand } from "../components/IdentityBand";
import { RichText } from "../components/RichText";
import { SiteFooter } from "../components/SiteFooter";
import { AboutInstitutions } from "../sections/About";
import { sectionRegistry } from "../sections";
import { flow } from "../content/flow-example";
import { FlowPipeline } from "../components/FlowPipeline";
import styles from "../styles/flow-example.module.css";
function Molecule({ kind }: { kind: number }) {
  return (
    <svg
      viewBox="-20 -20 40 40"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      {kind === 0 ? (
        <>
          <path d="M-10-8 0 0 10-8" />
          <circle r="6" fill="currentColor" />
          <circle cx="-10" cy="-8" r="3" />
          <circle cx="10" cy="-8" r="3" />
        </>
      ) : kind < 3 ? (
        <>
          <circle r={kind === 1 ? 8 : 10} />
          <circle r="15" strokeDasharray="1 5" />
          <path d="M-4 0H4" />
          {kind === 1 && <path d="M0-4V4" />}
        </>
      ) : kind === 3 ? (
        <>
          <path d="m-7-10 9 5v10l-9 5-9-5V-5Z m14 0 9 5v10l-9 5-9-5V-5Z" />
        </>
      ) : kind === 4 ? (
        <>
          <circle cx="-5" cy="4" r="6" />
          <circle cx="5" cy="4" r="6" />
          <circle cy="-5" r="6" />
        </>
      ) : (
        <path d="M-16 0C-12-19 4 18 12-5S-14-17-10 3 12 16 16 5" />
      )}
    </svg>
  );
}
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
    document.title = site.name;
    document.documentElement.dataset.flowTheme = theme;
    document.documentElement.style.backgroundColor =
      theme === "light" ? "#f2f0ea" : "#101a17";
    try {
      localStorage.setItem("memdesai-theme", theme);
    } catch {
      /* Local HTML still works when storage is restricted. */
    }
    document.dispatchEvent(new Event("flow:theme"));
  }, [theme]);
  const sections = site.nav;
  return (
    <div className={styles.page} data-theme={theme}>
      <a className={styles.skip} href="#about">
        {site.accessibility.skipLinkLabel}
      </a>
      <header className={styles.header}>
        <a className={styles.brand} href="#flow-top">
          {flow.name}
        </a>
        <nav aria-label={site.accessibility.navigationLabel}>
          {sections.slice(0, 3).map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
          <button
            className={styles.motionToggle}
            type="button"
            aria-label={theme === "dark" ? flow.lightTheme : flow.darkTheme}
            title={theme === "dark" ? flow.lightTheme : flow.darkTheme}
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
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
            aria-label={paused ? flow.resume : flow.pause}
            title={paused ? flow.resume : flow.pause}
            onClick={() => setPaused((p) => !p)}
          >
            <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
          </button>
          <a className={styles.button} href="#registration">
            {flow.register}
          </a>
        </nav>
      </header>
      <FlowPipeline paused={paused} />
      <main id="flow-top">
        <section className={styles.hero} data-flow-hero>
          <div className={styles.heroTop}>
            <p>{site.venue}</p>
            <p>{site.datesText}</p>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.concept}>{flow.concept}</p>
            <h1>
              {flow.name.split(" ").slice(0, -1).join(" ")}{" "}
              <span>{flow.name.split(" ").at(-1)}</span>
            </h1>
            <p className={styles.intro}>{flow.description}</p>
            <a className={styles.follow} href="#about">
              {flow.follow}
              <span aria-hidden="true">&#8595;</span>
            </a>
          </div>
        </section>
        {sections.map(({ id, label }, index) => {
          const gate = flow.sectionIds.findIndex(
            (sectionId) => sectionId === id,
          );
          const Section = sectionRegistry[id];
          return (
            <div key={id}>
              {gate >= 0 && (
                <div className={styles.gateLabel} data-flow-node>
                  <span className={styles.gateIndex} aria-hidden="true">
                    {String(gate + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.gateText}>
                    <span>{flow.gates[gate]}</span>
                    <small>{flow.gateDetails[gate]}</small>
                  </span>
                  <span className={styles.gateRule} />
                </div>
              )}
              {id === "about" ? (
                <section id={id} className={styles.section} tabIndex={-1}>
                  <div className={styles.copy}>
                    <p className={styles.kicker}>
                      {about.institutions.map(({ name }) => name).join(" · ")}
                    </p>
                    <h2>
                      {flow.headline[0]}
                      <br />
                      {flow.headline[1]}
                    </h2>
                    <h3 className={styles.aboutTitle}>
                      {about.title ?? sections[0].label}
                    </h3>
                    <RichText text={about.description} />
                    <div className={styles.legend}>
                      <h3>{flow.legendTitle}</h3>
                      <div>
                        {flow.legend.map((label, n) => (
                          <div key={label}>
                            <Molecule kind={n} />
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                      <p className={styles.flowHint}>{flow.hint}</p>
                      <details className={styles.science}>
                        <summary>{flow.scienceTitle}</summary>
                        <p>{flow.scienceNote}</p>
                        {flow.sources.map((source) => (
                          <a
                            key={source.url}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {source.label}
                          </a>
                        ))}
                      </details>
                    </div>
                  </div>
                  <div className={styles.shared}>
                    <IdentityBand />
                    <AboutInstitutions />
                  </div>
                  <nav
                    className={styles.sectionLinks}
                    aria-label={site.accessibility.navigationLabel}
                  >
                    {sections.slice(index + 1).map((section) => (
                      <a key={section.id} href={`#${section.id}`}>
                        {section.label}
                      </a>
                    ))}
                  </nav>
                </section>
              ) : id === "themes" ? (
                <section id={id} className={styles.section} tabIndex={-1}>
                  <div className={styles.copy}>
                    <h2>{themes.title ?? label}</h2>
                    <div className={styles.items}>
                      {themes.items.map(({ id, title, summary }) => (
                        <article key={id}>
                          <h3>{title}</h3>
                          <p>{summary}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ) : (
                <div className={styles.shared}>
                  <Section />
                </div>
              )}
            </div>
          );
        })}
      </main>
      <div className={styles.footer} data-flow-end>
        <a href="/countdown/">{flow.countdown}</a>
        <p>{flow.footer}</p>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? flow.resume : flow.pause}
        </button>
      </div>
      <div className={styles.shared}>
        <SiteFooter />
      </div>
    </div>
  );
}
