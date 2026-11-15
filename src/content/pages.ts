import { z } from "zod";
import data from "./pages.json";
export const pages = z
  .object({
    kind: z.enum(["static", "interactive", "multipage"]),
    routes: z.array(z.string().regex(/^\/(?:[a-z-]+\/)?$/)).min(2),
  })
  .parse(data);
