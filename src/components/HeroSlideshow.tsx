import { media } from "../content/media";
import { useSlideshow } from "./useSlideshow";
import styles from "../styles/media.module.css";
export function HeroSlideshow() {
  const { ref, index, playing, reduced, step, toggle, interaction } =
    useSlideshow(media.heroSlides.length);
  return (
    <div
      ref={ref}
      className={styles.heroSlideshow}
      role="region"
      aria-roledescription="carousel"
      aria-label={media.ui.heroGallery}
      {...interaction}
    >
      {media.heroSlides.map((slide, i) => (
        <div
          key={i}
          className={`${styles.heroFrame} ${i === index ? styles.active : ""} ${slide.kind === "design" ? styles.designed : ""}`}
          aria-hidden={i !== index}
        >
          {slide.kind === "photo" ? (
            <img
              src={slide.image.src}
              alt={slide.image.alt}
              width={slide.image.width}
              height={slide.image.height}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          ) : (
            <svg
              viewBox="0 0 1000 650"
              preserveAspectRatio="xMidYMid slice"
              role="img"
              aria-label={slide.caption}
            >
              <defs>
                <pattern
                  id="membrane-grid"
                  width="64"
                  height="56"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M16 1h32l16 27-16 27H16L0 28z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="1000" height="650" fill="url(#membrane-grid)" />
              <path
                d="M0 430Q250 220 500 430T1000 430M0 470Q250 260 500 470T1000 470M0 510Q250 300 500 510T1000 510"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
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
          {index + 1} / {media.heroSlides.length}
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
