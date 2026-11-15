import { site, themes } from "../content";
import { media } from "../content/media";
import { RichText } from "../components/RichText";
import styles from "../styles/site.module.css";

export function ThemesSection() {
  const title =
    themes.title ?? site.nav.find((item) => item.id === "themes")?.label ?? "";
  const background = media.science[0];

  return (
    <section
      id="themes"
      data-section
      className={`${styles.section} ${styles.themesSection}`}
      aria-labelledby="themes-heading"
    >
      <img
        className={styles.themesBackdrop}
        src={background.src}
        alt=""
        aria-hidden="true"
        width={background.width}
        height={background.height}
        style={{ objectPosition: background.focus }}
      />
      <div className={styles.container}>
        <h2 id="themes-heading" className={styles.sectionHeading}>
          {title}
        </h2>
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
      </div>
    </section>
  );
}
