import { z } from "zod";

// Query params for lifecycle API
export const lifecycleQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type LifecycleQueryParams = z.infer<typeof lifecycleQuerySchema>;

// Installation creation schema
export const createInstallationSchema = z.object({
  materialId: z.string().uuid(),
  locationName: z.string().min(1, "Location name is required"),
  slotInfo: z.string().optional(),
  installedAt: z.string().datetime(),
  notes: z.string().optional(),
});

export type CreateInstallationInput = z.infer<typeof createInstallationSchema>;
