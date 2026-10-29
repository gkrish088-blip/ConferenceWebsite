import { registration, site } from "../content";
import { ContentLink } from "../components/ContentLink";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import styles from "../styles/site.module.css";

export function RegistrationSection() {
  const title =
    site.nav.find((item) => item.id === "registration")?.label ?? "";

  return (
    <Section id="registration" title={title} alternate>
      <div data-registration-details>
        <RichText text={registration.details} />
        {registration.feeGroups.map((group) => (
          <table className={styles.feeTable} key={group.id}>
            <caption>{group.title}</caption>
            <thead>
              <tr>
                <th scope="col">{registration.feeColumns.category}</th>
                <th scope="col">
                  {registration.feeColumns.withoutAccommodation}
                </th>
                <th scope="col">{registration.feeColumns.withAccommodation}</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr key={row.category}>
                  <th scope="row">{row.category}</th>
                  <td>{row.withoutAccommodation}</td>
                  <td>{row.withAccommodation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <div className={styles.registrationLinks} data-registration-links>
        {registration.links.map((link, index) => (
          <ContentLink
            key={link.label}
            link={link}
            className={
              index === 0 ? styles.primaryButton : styles.secondaryButton
            }
          />
        ))}
      </div>
      <div className={styles.sponsorshipIntro} data-sponsorship-intro>
        <h3>{registration.sponsorshipHeading}</h3>
        <p>{registration.sponsorshipIntro}</p>
      </div>
      <div className={styles.sponsorshipTiers} data-sponsorship-tiers>
        {registration.tiers.map((tier) => (
          <article
            className={styles.sponsorshipTier}
            key={tier.id}
            data-sponsorship-tier
          >
            <h3>{tier.name}</h3>
            <p className={styles.tierAmount}>{tier.amount}</p>
            <ul>
              {tier.benefits.map((benefit, index) => (
                <li key={`${tier.id}-${index}`}>{benefit}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}
