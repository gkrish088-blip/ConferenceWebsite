import React from "react";
import { site } from "../content";
import { useScrollSpy } from "../lib/useScrollSpy";
import styles from "../styles/site.module.css";

export function SiteNavigation() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [identityScrolledOut, setIdentityScrolledOut] = React.useState(false);
  const activeId = useScrollSpy(site.nav.map((item) => item.id));

  React.useEffect(() => {
    const identity = document.querySelector("[data-identity-band]");
    if (!identity) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setIdentityScrolledOut(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(identity);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <nav
      className={styles.navShell}
      aria-label={site.accessibility.navigationLabel}
      data-site-navigation
    >
      <div className={styles.container}>
        <a
          className={`${styles.navBrand}${identityScrolledOut ? ` ${styles.navBrandVisible}` : ""}`}
          href="#top"
          data-scrolled-brand
        >
          {site.shortName}
        </a>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="site-navigation-links"
          aria-label={
            menuOpen
              ? site.accessibility.closeMenuLabel
              : site.accessibility.openMenuLabel
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" className={styles.menuIcon} />
        </button>
        <div
          id="site-navigation-links"
          className={`${styles.navLinks}${menuOpen ? ` ${styles.navLinksOpen}` : ""}`}
        >
          {site.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className={[
                styles.navLink,
                item.id === "registration" ? styles.registrationNavLink : "",
                activeId === item.id ? styles.navLinkActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
