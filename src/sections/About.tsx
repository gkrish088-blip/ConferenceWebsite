import { about, site } from "../content";
import { ContentLink } from "../components/ContentLink";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import { InstitutionMark } from "../components/InstitutionMark";
import styles from "../styles/site.module.css";

export function AboutSection() {
  const title =
    about.title ?? site.nav.find((item) => item.id === "about")?.label ?? "";

  return (
    <Section id="about" title={title}>
      <RichText text={about.description} />
      <AboutInstitutions />
    </Section>
  );
}

export function AboutInstitutions() {
  return (
    <div className={styles.institutionGrid}>
      {about.institutions.map((institution) => (
        <article
          className={styles.institutionBlock}
          key={institution.id}
          data-institution-card
        >
          <InstitutionMark institution={institution} showName={false} />
          <h3>{institution.name}</h3>
          <p>{institution.description}</p>
          <ContentLink
            link={{
              label: institution.linkLabel,
              url: institution.url,
              placeholder: institution.placeholder,
            }}
            className={styles.contentLink}
          />
        </article>
      ))}
    </div>
  );
}
