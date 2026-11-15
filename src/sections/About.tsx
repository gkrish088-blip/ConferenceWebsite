import { BrandImage } from "../components/BrandImage";
import { PhotoGallery } from "../components/PhotoGallery";
import { about, site } from "../content";
import { ContentLink } from "../components/ContentLink";
import { RichText } from "../components/RichText";
import { InstitutionMark } from "../components/InstitutionMark";
import styles from "../styles/site.module.css";

export function AboutSection() {
  const title =
    about.title ?? site.nav.find((item) => item.id === "about")?.label ?? "";

  return (
    <section
      id="about"
      data-section
      className={`${styles.section} ${styles.aboutSection}`}
      aria-labelledby="about-heading"
    >
      <div className={styles.aboutIntro}>
        <PhotoGallery />
        <div className={`${styles.container} ${styles.aboutReading}`}>
          <h2 id="about-heading" className={styles.sectionHeading}>
            {title}
          </h2>
          <RichText text={about.description} />
        </div>
      </div>
      <div className={`${styles.container} ${styles.aboutInstitutions}`}>
        <AboutInstitutions />
      </div>
    </section>
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
          {institution.secondaryLogo && (
            <BrandImage
              className={styles.departmentLogo}
              image={institution.secondaryLogo}
              loading="lazy"
            />
          )}
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
