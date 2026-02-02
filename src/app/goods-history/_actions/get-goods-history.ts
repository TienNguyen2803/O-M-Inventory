"use server";

import prisma from "@/lib/db";
import type { Material, GoodsHistoryEvent, GoodsHistorySubEvent } from "@/lib/types";
import type { MaterialTransactionDto, TransactionEventStep } from "@/lib/types/item-history";
import type { ReferenceType } from "@prisma/client";

/**
 * Map referenceType and inboundType/outboundPurpose to UI event type
 */
function mapToEventType(
  referenceType: ReferenceType,
  inboundTypeCode: string | null | undefined,
  outboundPurposeCode: string | null | undefined
): GoodsHistoryEvent["type"] {
  if (referenceType === "INBOUND_RECEIPT") {
    const typeCode = inboundTypeCode?.toUpperCase();
    if (typeCode === "RMA" || typeCode === "WARRANTY" || typeCode === "REPAIR") {
      return "inbound-rma";
    }
    return "inbound-po";
  }

  if (referenceType === "OUTBOUND_RECEIPT") {
    const purposeCode = outboundPurposeCode?.toUpperCase();
    if (purposeCode === "RMA" || purposeCode === "WARRANTY_SEND") {
      return "outbound-rma";
    }
    if (purposeCode === "WARRANTY_RETURN" || purposeCode === "RETURN") {
      return "outbound-warranty-return";
    }
    return "outbound-customer";
  }

  return "outbound-customer";
}

/**
 * Transform transaction events to subEvents format
 */
function transformToSubEvents(
  events: Array<{
    stepOrder: number | null;
    stepTitle: string | null;
    actorName: string;
    eventDate: Date;
    description: string;
  }>
): GoodsHistorySubEvent[] {
  if (!events || events.length === 0) {
    return [];
  }

  return events.map((event) => ({
    step: event.stepOrder ?? 0,
    title: event.stepTitle ?? event.description,
    actor: event.actorName,
    timestamp: event.eventDate.toISOString(),
    refId: undefined,
  }));
}

export async function getGoodsHistoryAction(serialNumber: string): Promise<{
  material: Material | undefined;
  history: GoodsHistoryEvent[];
}> {
  try {
    // Step 1: Find material by serial number using Prisma directly
    const material = await prisma.material.findFirst({
      where: { serialNumber },
      include: {
        materialCategory: { select: { code: true, name: true } },
        materialUnit: { select: { code: true, name: true } },
        materialStatus: { select: { code: true, name: true, color: true } },
        country: { select: { name: true } },
      },
    });

    if (!material) {
      return { material: undefined, history: [] };
    }

    // Step 2: Fetch transactions with events
    const transactions = await prisma.materialTransaction.findMany({
      where: { materialId: material.id },
      orderBy: { startedAt: "desc" },
      take: 50,
      include: {
        outboundPurpose: { select: { code: true, name: true } },
        inboundType: { select: { code: true, name: true } },
        events: {
          orderBy: { stepOrder: "asc" },
          select: {
            id: true,
            eventType: true,
            eventDate: true,
            actorName: true,
            stepOrder: true,
            stepTitle: true,
            description: true,
          },
        },
      },
    });

    // Step 3: Transform to UI types
    const materialResult: Material = {
      id: material.id,
      name: material.name,
      nameEn: material.nameEn ?? undefined,
      code: material.code,
      partNo: material.partNo,
      serialNumber: material.serialNumber ?? undefined,
      category: material.materialCategory.name,
      unit: material.materialUnit.name,
      status: material.materialStatus.name,
      stock: material.stock,
      manufacturer: material.manufacturer ?? undefined,
      origin: material.country?.name ?? undefined,
      location: material.location ?? undefined,
      stockAge: material.stockAge ?? undefined,
      supplierWarranty: material.supplierWarranty ?? undefined,
      serviceWarranty: material.serviceWarranty ?? undefined,
      chassisPn: material.chassisPn ?? undefined,
      chassisSn: material.chassisSn ?? undefined,
      originAsPerCustomer: material.originAsPerCustomer ?? undefined,
      originOnDocs: material.originOnDocs ?? undefined,
      warrantyCount: material.warrantyCount ?? undefined,
      lifespan: material.lifespan ?? undefined,
    };

    const history: GoodsHistoryEvent[] = transactions.map((tx) => ({
      id: tx.id,
      type: mapToEventType(
        tx.referenceType,
        tx.inboundType?.code,
        tx.outboundPurpose?.code
      ),
      title: tx.title,
      timestamp: tx.startedAt.toISOString(),
      subEvents: transformToSubEvents(tx.events),
    }));

    return { material: materialResult, history };
  } catch (error) {
    console.error("Error fetching goods history:", error);
    return { material: undefined, history: [] };
  }
}
