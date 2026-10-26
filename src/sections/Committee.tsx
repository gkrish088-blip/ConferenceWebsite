import type { z } from "zod";
import { committee, site } from "../content";
import type { committeeSchema } from "../content/schema";
import { Section } from "../components/Section";
import styles from "../styles/site.module.css";

type Group = z.infer<typeof committeeSchema>["groups"][number];
type Member = Group["members"][number];

function PersonDetails({
  member,
  portrait = false,
  headingLevel = 4,
}: {
  member: Member;
  portrait?: boolean;
  headingLevel?: 3 | 4;
}) {
  const NameHeading = `h${headingLevel}` as const;
  return (
    <>
      {portrait && member.photo && (
        <img
          className={styles.committeePortrait}
          src={member.photo.src}
          alt={member.photo.alt}
          style={{ objectPosition: member.photo.focus }}
        />
      )}
      <div className={styles.personDetails}>
        <NameHeading>{member.name}</NameHeading>
        <p>{member.role ?? member.affiliation}</p>
        {member.role && member.affiliation && <p>{member.affiliation}</p>}
      </div>
    </>
  );
}

function CommitteeGroup({ group }: { group: Group }) {
  if (group.layout === "featured") {
    const member = group.members[0];
    return (
      <div className={styles.featuredCommitteeGroup}>
        <h3>{group.title}</h3>
        <article className={styles.featuredCommitteePerson}>
          <PersonDetails member={member} portrait />
        </article>
      </div>
    );
  }

  if (group.layout === "pair") {
    return (
      <div className={styles.leadershipPair} data-committee-pair>
        {group.members.map((member) => (
          <article
            className={styles.pairMember}
            key={member.id}
            data-committee-pair-member
          >
            <PersonDetails member={member} headingLevel={3} />
          </article>
        ))}
      </div>
    );
  }

  if (group.layout === "grid") {
    return (
      <div className={styles.committeeGroup}>
        <h3>{group.title}</h3>
        <div className={styles.committeeGrid} data-committee-grid>
          {group.members.map((member) => (
            <article className={styles.committeeGridMember} key={member.id}>
              <PersonDetails member={member} />
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.committeeGroup}>
      <h3>{group.title}</h3>
      <ul className={styles.committeeList} data-committee-list>
        {group.members.map((member) => (
          <li key={member.id}>
            <PersonDetails member={member} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommitteeSection() {
  const title = site.nav.find((item) => item.id === "committee")?.label ?? "";
  const featured = committee.groups.find(
    (group) => group.layout === "featured",
  );
  const pair = committee.groups.find((group) => group.layout === "pair");
  const remaining = committee.groups.filter(
    (group) => group.layout !== "featured" && group.layout !== "pair",
  );

  return (
    <Section id="committee" title={title}>
      <div className={styles.committeeTree} data-committee-tree>
        {featured && <CommitteeGroup group={featured} />}
        {pair && <CommitteeGroup group={pair} />}
      </div>
      {remaining.map((group) => (
        <CommitteeGroup group={group} key={group.id} />
      ))}
    </Section>
  );
}
