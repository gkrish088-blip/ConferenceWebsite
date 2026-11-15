import { media } from "../content/media";
import { useSlideshow } from "./useSlideshow";
import styles from "../styles/media.module.css";

export function PhotoGallery() {
  const { ref, index, playing, reduced, step, toggle, interaction } =
    useSlideshow(media.gallery.length);
  return (
    <div
      ref={ref}
      className={styles.gallery}
      role="region"
      aria-roledescription="carousel"
      aria-label={media.ui.campusGallery}
      {...interaction}
    >
      <div className={styles.frames}>
        {media.gallery.map((image, i) => (
          <figure
            key={image.src}
            className={`${styles.frame} ${i === index ? styles.active : ""}`}
            aria-hidden={i !== index}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
            />
            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.galleryBar}>
        <p aria-live={playing ? "off" : "polite"}>
          {media.ui.position} {index + 1} {media.ui.of} {media.gallery.length}
        </p>
        <div className={styles.controls} data-gallery-controls>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={media.ui.previous}
          >
            <span aria-hidden="true">←</span>
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? media.ui.pause : media.ui.play}
              aria-pressed={playing}
            >
              <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={media.ui.next}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
