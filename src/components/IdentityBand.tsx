import { about, site } from "../content";
import { InstitutionMark } from "./InstitutionMark";
import styles from "../styles/site.module.css";

export function IdentityBand() {
  return (
    <div className={styles.identityBand} id="top" data-identity-band>
      <div className={styles.container}>
        {site.logo ? (
          <img
            className={styles.conferenceLogo}
            src={site.logo.src}
            alt={site.logo.alt}
            width={1468}
            height={482}
          />
        ) : (
          <p className={styles.identityName}>{site.shortName}</p>
        )}
        <div className={styles.identityMarks}>
          {about.institutions.map((institution) => (
            <InstitutionMark
              compact
              key={institution.id}
              institution={institution}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
