import { site, themes } from "../content";
import { Section } from "../components/Section";
import { RichText } from "../components/RichText";
import styles from "../styles/site.module.css";

export function ThemesSection() {
  const title =
    themes.title ?? site.nav.find((item) => item.id === "themes")?.label ?? "";

  return (
    <Section id="themes" title={title} alternate>
      {themes.items.length > 0 ? (
        <div className={styles.themeList}>
          {themes.items.map((theme) => (
            <article className={styles.themeItem} key={theme.id}>
              <h3>{theme.title}</h3>
              <RichText text={theme.summary} />
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>{themes.emptyText}</p>
      )}
    </Section>
  );
}
