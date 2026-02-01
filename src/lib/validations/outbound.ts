import { z } from "zod";

// Schema for OutboundReceiptItem with FK relations
export const outboundItemSchema = z.object({
  id: z.string().optional(),
  materialId: z.string().min(1, "Vật tư là bắt buộc"),
  unitId: z.string().min(1, "Đơn vị là bắt buộc"),
  locationId: z.string().optional().nullable(),
  requestedQuantity: z.coerce.number().int().positive("Số lượng yêu cầu phải lớn hơn 0"),
  issuedQuantity: z.coerce.number().int().nonnegative("Số lượng xuất phải không âm").default(0),
  serialBatch: z.string().optional().nullable(),
});

// Main OutboundReceipt schema with FK relations
export const outboundSchema = z.object({
  id: z.string().optional(),
  receiptCode: z.string().optional(), // Auto-generated if not provided
  purposeId: z.string().min(1, "Mục đích xuất là bắt buộc"),
  statusId: z.string().min(1, "Trạng thái là bắt buộc"),
  receiverId: z.string().min(1, "Người/đơn vị nhận là bắt buộc"),
  materialRequestId: z.string().optional().nullable(),
  createdById: z.string().optional(), // Set by server
  approverId: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  outboundDate: z.string().or(z.date()).transform((val) => new Date(val)),
  approvedAt: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  issuedAt: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  notes: z.string().optional().nullable(),
  step: z.number().int().min(1).max(4).default(1).optional(),
  items: z.array(outboundItemSchema).optional(),
});

export type OutboundFormValues = z.infer<typeof outboundSchema>;
export type OutboundItemValues = z.infer<typeof outboundItemSchema>;
