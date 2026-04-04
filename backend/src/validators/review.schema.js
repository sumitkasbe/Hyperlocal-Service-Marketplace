import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    booking_id: z.string().uuid("Invalid booking ID"),
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().min(2, "Comment must be at least 2 characters").max(500, "Comment too long").optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(2).max(500).optional(),
  }),
});