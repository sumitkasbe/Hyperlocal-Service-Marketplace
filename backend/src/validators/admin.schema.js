import { z } from "zod";

export const approveProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user id format"),
  }),
});

export const rejectProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user id format"),
  }),
  body: z.object({
    reason: z.string().min(3, "Reason must be at least 3 characters"),
  }),
});

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    avatar_url: z.string().url().optional(),
  }),
});

export const updateAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatar_url: z.string().url().optional(),
  }),
});