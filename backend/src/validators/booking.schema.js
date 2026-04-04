import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    service_id: z.string().uuid("Invalid service id"),
    provider_id: z.string().uuid("Invalid provider id"),
    booking_date: z.string().optional(),
    booking_time: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});