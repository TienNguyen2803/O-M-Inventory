import { prisma } from "@/lib/db";
import { OutboundClient } from "./_components/outbound-client";
import { OutboundReceipt, MasterDataItem } from "@/lib/types";

export default async function OutboundPage() {
  // Fetch outbound receipts with relations
  const [receiptsData, outboundPurposesData, outboundStatusesData] = await Promise.all([
    prisma.outboundReceipt.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        purpose: true,
        status: true,
        receiver: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            department: {
              select: { id: true, code: true, name: true },
            },
          },
        },
        materialRequest: {
          select: { id: true, requestCode: true },
        },
        createdBy: {
          select: { id: true, name: true, employeeCode: true },
        },
        approver: {
          select: { id: true, name: true, employeeCode: true },
        },
        items: {
          include: {
            material: {
              select: { id: true, code: true, name: true, partNo: true, stock: true },
            },
            unit: true,
            location: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    }),
    prisma.outboundPurpose.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.outboundStatus.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Transform Prisma data to match our application type
  const receipts: OutboundReceipt[] = receiptsData.map((r) => ({
    id: r.id,
    receiptCode: r.receiptCode,
    purposeId: r.purposeId,
    statusId: r.statusId,
    receiverId: r.receiverId,
    materialRequestId: r.materialRequestId,
    createdById: r.createdById,
    approverId: r.approverId,
    purpose: r.purpose ? { id: r.purpose.id, code: r.purpose.code, name: r.purpose.name, color: r.purpose.color } : undefined,
    status: r.status ? { id: r.status.id, code: r.status.code, name: r.status.name, color: r.status.color } : undefined,
    receiver: r.receiver ? {
      id: r.receiver.id,
      name: r.receiver.name,
      employeeCode: r.receiver.employeeCode || undefined,
      department: r.receiver.department || undefined,
    } : undefined,
    materialRequest: r.materialRequest || undefined,
    createdBy: r.createdBy || undefined,
    approver: r.approver || undefined,
    reason: r.reason,
    outboundDate: r.outboundDate.toISOString(),
    approvedAt: r.approvedAt?.toISOString() || null,
    issuedAt: r.issuedAt?.toISOString() || null,
    notes: r.notes,
    step: r.step,
    items: r.items.map((i) => ({
      id: i.id,
      receiptId: i.receiptId,
      materialId: i.materialId,
      unitId: i.unitId,
      locationId: i.locationId,
      material: i.material || undefined,
      unit: i.unit ? { id: i.unit.id, code: i.unit.code, name: i.unit.name } : undefined,
      location: i.location || undefined,
      requestedQuantity: i.requestedQuantity,
      issuedQuantity: i.issuedQuantity,
      serialBatch: i.serialBatch,
    })),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  // Transform master data
  const outboundPurposes: MasterDataItem[] = outboundPurposesData.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    color: p.color,
  }));

  const outboundStatuses: MasterDataItem[] = outboundStatusesData.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    color: s.color,
  }));

  return (
    <OutboundClient
      initialReceipts={receipts}
      outboundPurposes={outboundPurposes}
      outboundStatuses={outboundStatuses}
    />
  );
}
