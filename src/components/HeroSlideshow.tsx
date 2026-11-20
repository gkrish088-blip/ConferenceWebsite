import { media } from "../content/media";
import { useSlideshow } from "./useSlideshow";
import styles from "../styles/media.module.css";
const crops = [1, 1.18, 1.36];

export function HeroSlideshow() {
  const { ref, index, playing, reduced, step, toggle, interaction } =
    useSlideshow(crops.length);
  return (
    <div
      ref={ref}
      className={styles.heroSlideshow}
      role="region"
      aria-roledescription="carousel"
      aria-label={media.ui.heroGallery}
      {...interaction}
    >
      {crops.map((scale, i) => (
        <div
          key={scale}
          className={`${styles.heroFrame} ${i === index ? styles.active : ""}`}
          aria-hidden={i !== index}
        >
          <img
            src={media.titleImage.src}
            alt={media.titleImage.alt}
            width={media.titleImage.width}
            height={media.titleImage.height}
            style={{ transform: `scale(${scale})` }}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
        </div>
      ))}
      <div className={styles.heroScrim} />
      <div className={styles.heroControls} data-gallery-controls>
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={media.ui.previous}
        >
          ←
        </button>
        <span aria-live={playing ? "off" : "polite"}>
          {index + 1} / {crops.length}
        </span>
        {!reduced && (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? media.ui.pause : media.ui.play}
            aria-pressed={playing}
          >
            {playing ? "Ⅱ" : "▷"}
          </button>
        )}
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={media.ui.next}
        >
          →
        </button>
      </div>
    </div>
  );
}
