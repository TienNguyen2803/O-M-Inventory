import { z } from "zod";

// Query params for history API
export const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type HistoryQueryParams = z.infer<typeof historyQuerySchema>;
