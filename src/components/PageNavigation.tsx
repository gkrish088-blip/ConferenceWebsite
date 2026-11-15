import React from "react";
import { site } from "../content";
import { pathFor, type PageId } from "../app/router";
import styles from "../styles/site.module.css";

function plainClick(event: React.MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function PageNavigation({
  current,
  onNavigate,
  controls,
}: {
  current: PageId;
  onNavigate: (id: PageId) => void;
  controls?: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [identityScrolledOut, setIdentityScrolledOut] = React.useState(false);

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

  const go = (id: PageId) => (event: React.MouseEvent) => {
    if (!plainClick(event)) return;
    event.preventDefault();
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <nav
      className={styles.navShell}
      aria-label={site.accessibility.navigationLabel}
      data-site-navigation
    >
      <div className={styles.container}>
        <a
          className={`${styles.navBrand}${identityScrolledOut ? ` ${styles.navBrandVisible}` : ""}`}
          href="/"
          onClick={go("about")}
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
              href={pathFor(item.id)}
              aria-current={current === item.id ? "page" : undefined}
              className={[
                styles.navLink,
                item.id === "registration" ? styles.registrationNavLink : "",
                current === item.id ? styles.navLinkActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={go(item.id as PageId)}
            >
              {item.label}
            </a>
          ))}
          {controls}
        </div>
      </div>
    </nav>
  );
}
