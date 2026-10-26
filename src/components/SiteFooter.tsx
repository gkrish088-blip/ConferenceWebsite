import { about, contact, site } from "../content";
import { InstitutionMark } from "./InstitutionMark";
import styles from "../styles/site.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.container}>
        <div className={styles.footerMarks}>
          {about.institutions.map((institution) => (
            <InstitutionMark
              compact
              key={institution.id}
              institution={institution}
            />
          ))}
        </div>
        <div className={styles.footerConference}>
          <p className={styles.footerName}>{site.shortName}</p>
          <p className={styles.footerCopyright}>{site.footer.copyright}</p>
        </div>
        <a
          className={styles.footerEmail}
          href={`mailto:${contact.persons[0]?.email ?? ""}`}
        >
          {contact.persons[0]?.email}
        </a>
      </div>
    </footer>
  );
}
