import type { MouseEvent } from "react";
import { site } from "../content";
import { membranes } from "../content/membranes";
import { pathFor, type PageId } from "../app/router";
import styles from "../styles/membrane-site.module.css";

export function Pager({
  current,
  onNavigate,
}: {
  current: PageId;
  onNavigate: (id: PageId) => void;
}) {
  const index = site.nav.findIndex((item) => item.id === current);
  const prev = index > 0 ? site.nav[index - 1] : undefined;
  const next = index < site.nav.length - 1 ? site.nav[index + 1] : undefined;
  const go = (id: PageId) => (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    event.preventDefault();
    onNavigate(id);
  };

  return (
    <nav className={styles.pager} aria-label={membranes.ui.pagerLabel}>
      {prev ? (
        <a
          className={styles.pagerLink}
          href={pathFor(prev.id)}
          rel="prev"
          onClick={go(prev.id as PageId)}
        >
          <span>← {membranes.ui.previous}</span>
          <strong>{prev.label}</strong>
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a
          className={`${styles.pagerLink} ${styles.pagerNext}`}
          href={pathFor(next.id)}
          rel="next"
          onClick={go(next.id as PageId)}
        >
          <span>{membranes.ui.next} →</span>
          <strong>{next.label}</strong>
        </a>
      )}
    </nav>
  );
}
