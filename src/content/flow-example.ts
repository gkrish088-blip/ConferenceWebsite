import { z } from "zod";
import data from "./flow-example.json";
const text = z.string().min(1);
export const flow = z
  .object({
    placeholder: z.literal(true),
    name: text,
    register: text,
    countdown: text,
    sectionIds: z
      .array(z.enum(["about", "themes", "dates", "registration", "contact"]))
      .length(5),
    inventory: z
      .array(z.object({ path: text, label: text, placeholder: z.boolean() }))
      .length(2),
    headline: z.array(text).length(2),
    description: text,
    concept: text,
    follow: text,
    legendTitle: text,
    legend: z.array(text).length(6),
    gates: z.array(text).length(5),
    gateDetails: z.array(text).length(5),
    scienceTitle: text,
    scienceNote: text,
    sources: z.array(z.object({ label: text, url: z.url() })).min(1),
    hint: text,
    lightTheme: text,
    darkTheme: text,
    pause: text,
    resume: text,
    footer: text,
  })
  .parse(data);
