import { z } from "zod";

export const inboundItemSchema = z.object({
  id: z.string().optional(),
  materialCode: z.string().min(1, "Mã vật tư là bắt buộc"),
  materialName: z.string().min(1, "Tên vật tư là bắt buộc"),
  orderedQuantity: z.coerce.number().int().nonnegative("Số lượng đặt phải không âm"),
  receivedQuantity: z.coerce.number().int().nonnegative("Số lượng đã nhập phải không âm"),
  receivingQuantity: z.coerce.number().int().nonnegative("Số lượng thực nhập phải không âm"),
  serialBatch: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  kcs: z.boolean().default(false).optional(),
});

export const inboundSchema = z.object({
  id: z.string().optional(), // This might be the receiptCode in practice
  receiptCode: z.string().min(1, "Số phiếu là bắt buộc").optional(), // Allow optional if auto-generated
  inboundType: z.enum(['Theo PO', 'Sau Sửa chữa', 'Hàng Mượn', 'Hoàn trả'], {
    required_error: "Loại nhập kho là bắt buộc",
  }),
  reference: z.string().min(1, "Tham chiếu là bắt buộc"),
  inboundDate: z.string().or(z.date()).transform((val) => new Date(val)),
  partner: z.string().min(1, "Đối tác là bắt buộc"),
  status: z.enum(['Hoàn thành', 'Đang nhập', 'KCS & Hồ sơ', 'Yêu cầu nhập'], {
    required_error: "Trạng thái là bắt buộc",
  }),
  items: z.array(inboundItemSchema).optional(),
});

export type InboundFormValues = z.infer<typeof inboundSchema>;
export type InboundItemValues = z.infer<typeof inboundItemSchema>;
