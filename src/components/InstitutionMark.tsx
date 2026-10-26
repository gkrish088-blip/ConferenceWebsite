import type { z } from "zod";
import type { institutionSchema } from "../content/schema";
import styles from "../styles/site.module.css";

type Institution = z.infer<typeof institutionSchema>;

export function InstitutionMark({
  institution,
  compact = false,
  showName = true,
}: {
  institution: Institution;
  compact?: boolean;
  showName?: boolean;
}) {
  return (
    <div
      className={`${styles.institutionMark}${compact ? ` ${styles.compactMark}` : ""}`}
    >
      <img
        className={styles.logoImage}
        src={institution.logo.src}
        alt={institution.logo.alt}
      />
      {showName && <span>{institution.name}</span>}
    </div>
  );
}
