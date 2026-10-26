import React from "react";
import { site } from "../content";
import { IdentityBand } from "../components/IdentityBand";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNavigation } from "../components/SiteNavigation";
import { LandingApp } from "./LandingApp";
import { Hero } from "../sections/Hero";
import { sectionRegistry } from "../sections";
import styles from "../styles/site.module.css";

export function MainApp() {
  const isCountdownPath =
    window.location.pathname.replace(/\/+$/, "") === "/countdown";

  React.useEffect(() => {
    document.title = site.name;
  }, []);

  if (isCountdownPath) return <LandingApp fullMode />;

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {site.accessibility.skipLinkLabel}
      </a>
      <IdentityBand />
      <SiteNavigation />
      <main id="main-content">
        <Hero />
        {site.nav.map((item) => {
          const Component = sectionRegistry[item.id];
          return Component ? <Component key={item.id} /> : null;
        })}
      </main>
      <SiteFooter />
    </>
  );
}
