import { contact, site } from "../content";
import { ContentLink } from "../components/ContentLink";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import styles from "../styles/site.module.css";

export function ContactSection() {
  const title = site.nav.find((item) => item.id === "contact")?.label ?? "";
  const mapLink = {
    label: contact.mapLabel,
    url: contact.mapUrl,
    placeholder: contact.placeholder,
  };

  return (
    <Section id="contact" title={title} alternate>
      <div className={styles.contactGrid}>
        {contact.persons.map((person) => (
          <article className={styles.contactPerson} key={person.id}>
            <h3>{person.name}</h3>
            <p>{person.role}</p>
            <a href={`mailto:${person.email}`}>{person.email}</a>
            {person.phone && <a href={`tel:${person.phone}`}>{person.phone}</a>}
          </article>
        ))}
      </div>
      <div className={styles.contactAddress}>
        <RichText text={contact.address} />
        <ContentLink link={mapLink} className={styles.contentLink} />
      </div>
    </Section>
  );
}
