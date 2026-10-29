import type { z } from "zod";
import type { institutionSchema } from "../content/schema";
import { site } from "../content/landing";
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
    <a
      className={`${styles.institutionMark}${compact ? ` ${styles.compactMark}` : ""}`}
      href={institution.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${institution.name} (${site.accessibility.externalLinkText})`}
    >
      <img
        className={styles.logoImage}
        src={institution.logo.src}
        alt={institution.logo.alt}
      />
      {showName && <span>{institution.name}</span>}
    </a>
  );
}
