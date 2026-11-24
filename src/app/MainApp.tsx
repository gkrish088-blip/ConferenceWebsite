import React from "react";
import { site } from "../content";
import { IdentityBand } from "../components/IdentityBand";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNavigation } from "../components/SiteNavigation";
import { pages } from "../content/pages";
import { PageSection } from "../components/Section";
import { Hero } from "../sections/Hero";
import { sectionRegistry } from "../sections";
import styles from "../styles/site.module.css";

export function MainApp({ pathname }: { pathname: string }) {
  const id = pathname.split("/").filter(Boolean)[0] ?? "about";
  const Section = sectionRegistry[id];
  const home = id === "about";
  React.useEffect(() => {
    if (!home) return;
    const forward = () => {
      const hash = window.location.hash;
      const target = hash.slice(1).split("-")[0];
      const path = `/${target}/`;
      if (pages.routes.includes(path)) {
        window.location.replace(path + window.location.search + hash);
      }
    };
    forward();
    window.addEventListener("hashchange", forward);
    return () => window.removeEventListener("hashchange", forward);
  }, [home]);
  return (
    <PageSection.Provider value={home ? undefined : id}>
      <a className={styles.skipLink} href="#main-content">
        {site.accessibility.skipLinkLabel}
      </a>
      <IdentityBand />
      <SiteNavigation activeId={id} />
      <main id="main-content">
        {home && <Hero />}
        {Section && <Section />}
      </main>
      <SiteFooter />
    </PageSection.Provider>
  );
}
