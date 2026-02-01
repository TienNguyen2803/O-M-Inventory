import prisma from "@/lib/db";
import { MaterialEventType } from "@prisma/client";
import { CreateMaterialEventInput } from "@/lib/types/lifecycle";

/**
 * Creates a material lifecycle event record
 * Used by various API endpoints to log material state changes
 */
export async function createMaterialEvent(
  input: CreateMaterialEventInput
): Promise<{ id: string }> {
  const event = await prisma.materialEvent.create({
    data: {
      materialId: input.materialId,
      eventType: input.eventType,
      eventDate: input.eventDate,
      actorId: input.actorId,
      actorName: input.actorName,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      referenceCode: input.referenceCode,
      description: input.description,
      metadata: input.metadata ?? undefined,
    },
    select: { id: true },
  });

  return event;
}

/**
 * Creates multiple material events in a transaction
 * Used for bulk operations like inbound receipts with multiple items
 */
export async function createMaterialEventsBatch(
  inputs: CreateMaterialEventInput[]
): Promise<{ count: number }> {
  const result = await prisma.materialEvent.createMany({
    data: inputs.map((input) => ({
      materialId: input.materialId,
      eventType: input.eventType,
      eventDate: input.eventDate,
      actorId: input.actorId,
      actorName: input.actorName,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      referenceCode: input.referenceCode,
      description: input.description,
      metadata: input.metadata ?? undefined,
    })),
  });

  return { count: result.count };
}

/**
 * Helper to build event description based on event type
 */
export function buildEventDescription(
  eventType: MaterialEventType,
  context: {
    materialCode?: string;
    referenceCode?: string;
    quantity?: number;
    locationName?: string;
  }
): string {
  switch (eventType) {
    case "REQUEST":
      return `Yêu cầu vật tư trong ${context.referenceCode}`;
    case "APPROVED":
      return `Yêu cầu ${context.referenceCode} được duyệt`;
    case "PO_ISSUED":
      return `Đơn hàng ${context.referenceCode} được phát hành`;
    case "INBOUND":
      return `Nhập kho ${context.quantity ?? 1} đơn vị qua ${context.referenceCode}`;
    case "QC":
      return `Kiểm tra chất lượng (KCS) hoàn thành`;
    case "OUTBOUND":
      return `Xuất kho ${context.quantity ?? 1} đơn vị qua ${context.referenceCode}`;
    case "INSTALLED":
      return `Lắp đặt tại ${context.locationName ?? "vị trí không xác định"}`;
    default:
      return `Sự kiện vòng đời: ${eventType}`;
  }
}
