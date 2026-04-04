import { z } from "zod";

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^\d+$/, 
      "Invalid ID format"
    ),
  }),
});