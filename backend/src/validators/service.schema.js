import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    service_id: z.number().int().positive("Invalid service id"),
  }),
});
