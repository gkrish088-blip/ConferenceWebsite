import { z } from "zod";
import data from "./flow-example.json";
const text = z.string().min(1);
export const flow = z
  .object({
    countdown: text,
    wordmark: z.tuple([text, text]),
    sectionIds: z
      .array(z.enum(["about", "themes", "dates", "registration", "contact"]))
      .length(5),
    inventory: z
      .array(z.object({ path: text, label: text, placeholder: z.boolean() }))
      .length(2),
    lightTheme: text,
    darkTheme: text,
    pause: text,
    resume: text,
  })
  .parse(data);
