import * as z from 'zod'

// Validation schema for create/update WarehouseLocation with FK IDs
export const warehouseLocationSchema = z.object({
  code: z.string().min(1, 'Mã vị trí là bắt buộc'),
  name: z.string().min(1, 'Tên/Mô tả là bắt buộc'),
  areaId: z.string().min(1, 'Khu vực là bắt buộc'),
  typeId: z.string().min(1, 'Loại lưu trữ là bắt buộc'),
  statusId: z.string().min(1, 'Trạng thái là bắt buộc'),
  barcode: z.string().optional().nullable(),
  maxWeight: z.number().optional().nullable(),
  dimensions: z.string().optional().nullable(),
})

export type WarehouseLocationInput = z.infer<typeof warehouseLocationSchema>
