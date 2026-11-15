import { z } from "zod";
import data from "./membranes.json";
import { sceneIds } from "../membrane/scenes";

const text = z.string().min(1);
const navIds = [
  "about",
  "themes",
  "dates",
  "speakers",
  "committee",
  "registration",
  "hospitality",
  "contact",
] as const;

export const membranesSchema = z.object({
  ui: z.object({
    wordmark: z.tuple([text, text]),
    pause: text,
    resume: text,
    lightTheme: text,
    darkTheme: text,
    countdown: text,
    previous: text,
    next: text,
    simulation: text,
    passed: text,
    pagerLabel: text,
  }),
  pages: z
    .array(
      z.object({
        id: z.enum(navIds),
        scene: z.enum(sceneIds),
        label: text,
        caption: text,
        species: z.record(z.string(), text),
      }),
    )
    .length(navIds.length)
    .refine(
      (pages) => new Set(pages.map((page) => page.scene)).size === pages.length,
      "Every page must use a different membrane scene",
    ),
});

export const membranes = membranesSchema.parse(data);
export type MembranePage = (typeof membranes.pages)[number];
