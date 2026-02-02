import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { historyQuerySchema } from "@/lib/validations/item-history";
import type {
  MaterialHistoryResponse,
  MaterialTransactionDto,
  ItemHistoryStatistics,
  TransactionEventStep,
} from "@/lib/types/item-history";
import type { MaterialInfoExtended } from "@/lib/types/lifecycle";

type RouteParams = {
  params: Promise<{ id: string }>;
};

const MS_PER_DAY = 86_400_000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function calculateAge(createdAt: Date): { value: number; unit: string } {
  const days = Math.floor((Date.now() - createdAt.getTime()) / MS_PER_DAY);
  if (days < 0) {
    console.warn(`Future createdAt detected: ${createdAt.toISOString()}`);
    return { value: 0, unit: "days" };
  }
  if (days < 30) return { value: days, unit: "days" };
  if (days < 365) return { value: Math.floor(days / 30), unit: "months" };
  return { value: Math.floor(days / 365), unit: "years" };
}

/**
 * GET /api/materials/[id]/history
 * Returns the transaction history for a specific material
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid material ID format" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = historyQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { limit, offset } = queryResult.data;

    // Fetch material with related data (including extended fields for goods-history)
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        materialCategory: { select: { code: true, name: true } },
        materialUnit: { select: { code: true, name: true } },
        materialStatus: { select: { code: true, name: true, color: true } },
        country: { select: { name: true } },
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Fetch transactions with pagination
    const [transactions, totalCount, inboundCount, outboundCount, completedCount, pendingCount] = await Promise.all([
      prisma.materialTransaction.findMany({
        where: { materialId: id },
        orderBy: { startedAt: "desc" },
        skip: offset,
        take: limit,
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
              referenceCode: true,
              description: true,
            },
          },
        },
      }),
      prisma.materialTransaction.count({ where: { materialId: id } }),
      prisma.materialTransaction.count({
        where: { materialId: id, referenceType: "INBOUND_RECEIPT" }
      }),
      prisma.materialTransaction.count({
        where: { materialId: id, referenceType: "OUTBOUND_RECEIPT" }
      }),
      prisma.materialTransaction.count({
        where: { materialId: id, status: "COMPLETED" }
      }),
      prisma.materialTransaction.count({
        where: { materialId: id, status: "PENDING" }
      }),
    ]);

    // Build material info with extended fields for goods-history
    const materialInfo: MaterialInfoExtended = {
      id: material.id,
      code: material.code,
      name: material.name,
      serialNumber: material.serialNumber,
      partNo: material.partNo,
      category: material.materialCategory,
      unit: material.materialUnit,
      status: material.materialStatus,
      // Extended fields
      nameEn: material.nameEn,
      manufacturer: material.manufacturer,
      location: material.location,
      stockAge: material.stockAge,
      supplierWarranty: material.supplierWarranty,
      serviceWarranty: material.serviceWarranty,
      chassisPn: material.chassisPn,
      chassisSn: material.chassisSn,
      origin: material.country?.name ?? null,
      originAsPerCustomer: material.originAsPerCustomer,
      originOnDocs: material.originOnDocs,
      warrantyCount: material.warrantyCount,
      lifespan: material.lifespan,
    };

    // Calculate age
    const ageInDays = Math.floor((Date.now() - material.createdAt.getTime()) / MS_PER_DAY);
    const ageDisplay = calculateAge(material.createdAt);

    // Build statistics
    const statistics: ItemHistoryStatistics = {
      totalTransactions: totalCount,
      completedTransactions: completedCount,
      pendingTransactions: pendingCount,
      totalInbound: inboundCount,
      totalOutbound: outboundCount,
      ageInDays,
      ageDisplay,
    };

    // Transform transactions to DTOs with events
    const transactionDtos: MaterialTransactionDto[] = transactions.map((tx) => ({
      id: tx.id,
      title: tx.title,
      status: tx.status,
      quantity: tx.quantity,
      referenceType: tx.referenceType,
      referenceId: tx.referenceId,
      counterpartyName: tx.counterpartyName,
      outboundPurpose: tx.outboundPurpose,
      inboundType: tx.inboundType,
      startedAt: tx.startedAt.toISOString(),
      completedAt: tx.completedAt?.toISOString() ?? null,
      createdAt: tx.createdAt.toISOString(),
      events: tx.events.map((evt): TransactionEventStep => ({
        id: evt.id,
        eventType: evt.eventType,
        eventDate: evt.eventDate.toISOString(),
        actorName: evt.actorName,
        stepOrder: evt.stepOrder,
        stepTitle: evt.stepTitle,
        description: evt.description,
      })),
    }));

    const response: MaterialHistoryResponse = {
      material: materialInfo,
      statistics,
      transactions: transactionDtos,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching material history:", error);
    return NextResponse.json(
      { error: "Failed to fetch material history" },
      { status: 500 }
    );
  }
}
