import { useSyncExternalStore } from "react";
import { membranes, type MembranePage } from "../content/membranes";
import { getStats, subscribeStats } from "../membrane/stats";
import styles from "../styles/membrane-site.module.css";

export function MembraneCaption({ page }: { page: MembranePage }) {
  const stats = useSyncExternalStore(subscribeStats, getStats, getStats);
  const items = stats.scene === page.scene ? stats.items : [];

  return (
    <aside className={styles.caption} data-membrane-caption>
      <p className={styles.captionKicker}>{membranes.ui.simulation}</p>
      <h2 className={styles.captionTitle}>{page.label}</h2>
      <p className={styles.captionText}>{page.caption}</p>
      <ul className={styles.legend}>
        {items.map((item) => (
          <li key={item.key}>
            <span
              className={styles.swatch}
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <span>{page.species[item.key] ?? item.key}</span>
            <span
              className={styles.legendCount}
              title={membranes.ui.passed}
              aria-hidden="true"
            >
              {item.count}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
