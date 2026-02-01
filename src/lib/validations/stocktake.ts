import { z } from "zod";

// Schema for StocktakeAssignment
export const stocktakeAssignmentSchema = z.object({
  id: z.string().optional(),
  locationId: z.string().min(1, "Vị trí là bắt buộc"),
  assigneeId: z.string().min(1, "Người phụ trách là bắt buộc"),
  statusId: z.string().optional(),
});

// Schema for StocktakeResult
export const stocktakeResultSchema = z.object({
  id: z.string().optional(),
  materialId: z.string().min(1, "Vật tư là bắt buộc"),
  locationId: z.string().min(1, "Vị trí là bắt buộc"),
  unitId: z.string().min(1, "Đơn vị là bắt buộc"),
  countedById: z.string().optional(),
  bookQuantity: z.coerce.number().int().nonnegative("Số lượng sổ sách phải không âm"),
  actualQuantity: z.coerce.number().int().nonnegative("Số lượng thực tế phải không âm"),
  variance: z.coerce.number().int().optional(),
  serialBatch: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  updatedAt: z.string().or(z.date()).optional(), // For optimistic locking
});

// Schema for bulk result update
export const stocktakeBulkResultSchema = z.object({
  results: z.array(stocktakeResultSchema).max(50, "Tối đa 50 kết quả mỗi lần"),
});

// Main Stocktake schema
export const stocktakeSchema = z.object({
  id: z.string().optional(),
  takeCode: z.string().optional(), // Auto-generated if not provided
  name: z.string().min(1, "Tên đợt kiểm kê là bắt buộc"),
  statusId: z.string().optional(), // Default to DRAFT
  areaId: z.string().min(1, "Phạm vi kiểm kê là bắt buộc"),
  createdById: z.string().optional(), // Set by server
  takeDate: z.string().or(z.date()).transform((val) => new Date(val)),
  notes: z.string().optional().nullable(),
  assignments: z.array(stocktakeAssignmentSchema).optional(),
});

export type StocktakeFormValues = z.infer<typeof stocktakeSchema>;
export type StocktakeAssignmentValues = z.infer<typeof stocktakeAssignmentSchema>;
export type StocktakeResultValues = z.infer<typeof stocktakeResultSchema>;
export type StocktakeBulkResultValues = z.infer<typeof stocktakeBulkResultSchema>;
