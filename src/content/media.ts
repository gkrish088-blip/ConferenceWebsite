import { z } from "zod";
import data from "./media.json";
const text = z.string().min(1);
const image = z.object({
  src: z.string().regex(/^\/assets\/approved\//),
  alt: text,
  caption: z.string(),
  focus: z.enum(["center", "top", "bottom", "left", "right"]),
  width: z.number().positive(),
  height: z.number().positive(),
  placeholder: z.literal(false),
});
export const mediaSchema = z.object({
  placeholder: z.literal(false),
  campusTitle: text,
  scienceTitle: text,
  gallery: z.array(image).min(2),
  science: z.array(image).min(1),
  ui: z.object({
    previous: text,
    next: text,
    pause: text,
    play: text,
    position: text,
    of: text,
    campusGallery: text,
    heroGallery: text,
    designSlide: text,
    photoSource: text,
  }),
  heroSlides: z
    .array(
      z.discriminatedUnion("kind", [
        z.object({ kind: z.literal("photo"), image }),
        z.object({ kind: z.literal("design"), caption: text }),
      ]),
    )
    .min(2),
});
export const media = mediaSchema.parse(data);
