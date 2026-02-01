import { z } from "zod";

// Schema for InboundReceiptItem with FK relations
export const inboundItemSchema = z.object({
  id: z.string().optional(),
  materialId: z.string().min(1, "Vật tư là bắt buộc"),
  unitId: z.string().min(1, "Đơn vị là bắt buộc"),
  locationId: z.string().optional().nullable(),
  orderedQuantity: z.coerce.number().int().nonnegative("Số lượng đặt phải không âm"),
  receivedQuantity: z.coerce.number().int().nonnegative("Số lượng đã nhập phải không âm").default(0),
  receivingQuantity: z.coerce.number().int().nonnegative("Số lượng thực nhập phải không âm").default(0),
  serialBatch: z.string().optional().nullable(),
  kcs: z.boolean().default(false).optional(),
});

// Schema for InboundDocument with FK relation
export const inboundDocumentSchema = z.object({
  id: z.string().optional(),
  typeId: z.string().min(1, "Loại hồ sơ là bắt buộc"),
  fileName: z.string().min(1, "Tên file là bắt buộc"),
  fileUrl: z.string().optional().nullable(),
});

// Main InboundReceipt schema with FK relations
export const inboundSchema = z.object({
  id: z.string().optional(),
  receiptCode: z.string().optional(), // Auto-generated if not provided
  typeId: z.string().min(1, "Loại nhập kho là bắt buộc"),
  statusId: z.string().min(1, "Trạng thái là bắt buộc"),
  supplierId: z.string().min(1, "Nhà cung cấp là bắt buộc"),
  purchaseRequestId: z.string().optional().nullable(),
  createdById: z.string().optional(), // Set by server
  referenceCode: z.string().optional().nullable(),
  inboundDate: z.string().or(z.date()).transform((val) => new Date(val)),
  notes: z.string().optional().nullable(),
  step: z.number().int().min(1).max(4).default(1).optional(),
  items: z.array(inboundItemSchema).optional(),
  documents: z.array(inboundDocumentSchema).optional(),
});

export type InboundFormValues = z.infer<typeof inboundSchema>;
export type InboundItemValues = z.infer<typeof inboundItemSchema>;
export type InboundDocumentValues = z.infer<typeof inboundDocumentSchema>;
