import type { ReactNode } from "react";
import styles from "../styles/site.module.css";

export function Section({
  id,
  title,
  alternate = false,
  children,
}: {
  id: string;
  title: string;
  alternate?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${styles.section}${alternate ? ` ${styles.sectionAlternate}` : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className={styles.container}>
        <h2 id={`${id}-heading`} className={styles.sectionHeading}>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
