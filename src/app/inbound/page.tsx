import { prisma } from "@/lib/db";
import { InboundClient } from "./_components/inbound-client";
import { InboundReceipt, MasterDataItem } from "@/lib/types";

export default async function InboundPage() {
  // Fetch inbound receipts with relations
  const [receiptsData, inboundTypesData, inboundStatusesData] = await Promise.all([
    prisma.inboundReceipt.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        type: true,
        status: true,
        supplier: true,
        purchaseRequest: {
          select: { id: true, requestCode: true, description: true },
        },
        createdBy: {
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
        documents: {
          include: {
            type: true,
          },
        },
      },
    }),
    prisma.inboundType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.inboundStatus.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Transform Prisma data to match our application type
  const receipts: InboundReceipt[] = receiptsData.map((r) => ({
    id: r.id,
    receiptCode: r.receiptCode,
    typeId: r.typeId,
    statusId: r.statusId,
    supplierId: r.supplierId,
    purchaseRequestId: r.purchaseRequestId,
    createdById: r.createdById,
    type: r.type ? { id: r.type.id, code: r.type.code, name: r.type.name, color: r.type.color } : undefined,
    status: r.status ? { id: r.status.id, code: r.status.code, name: r.status.name, color: r.status.color } : undefined,
    supplier: r.supplier ? { id: r.supplier.id, code: r.supplier.code, name: r.supplier.name } : undefined,
    purchaseRequest: r.purchaseRequest || undefined,
    createdBy: r.createdBy || undefined,
    referenceCode: r.referenceCode,
    inboundDate: r.inboundDate.toISOString(),
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
      orderedQuantity: i.orderedQuantity,
      receivedQuantity: i.receivedQuantity,
      receivingQuantity: i.receivingQuantity,
      serialBatch: i.serialBatch,
      kcs: i.kcs,
    })),
    documents: r.documents.map((d) => ({
      id: d.id,
      receiptId: d.receiptId,
      typeId: d.typeId,
      type: d.type ? { id: d.type.id, code: d.type.code, name: d.type.name } : undefined,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
    })),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  // Transform master data
  const inboundTypes: MasterDataItem[] = inboundTypesData.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    color: t.color,
  }));

  const inboundStatuses: MasterDataItem[] = inboundStatusesData.map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    color: s.color,
  }));

  return (
    <InboundClient
      initialReceipts={receipts}
      inboundTypes={inboundTypes}
      inboundStatuses={inboundStatuses}
    />
  );
}
