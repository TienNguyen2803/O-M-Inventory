import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type {
  MaterialTransactionDetailResponse,
  MaterialTransactionDto,
  TransactionEventStep,
} from "@/lib/types/item-history";
import type { MaterialInfo } from "@/lib/types/lifecycle";

type RouteParams = {
  params: Promise<{ id: string; txId: string }>;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/materials/[id]/transactions/[txId]
 * Returns the transaction detail with events for a specific material
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, txId } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id) || !UUID_REGEX.test(txId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Fetch transaction with events and material
    const transaction = await prisma.materialTransaction.findFirst({
      where: {
        id: txId,
        materialId: id, // Ensure transaction belongs to this material
      },
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
        material: {
          include: {
            materialCategory: { select: { code: true, name: true } },
            materialUnit: { select: { code: true, name: true } },
            materialStatus: { select: { code: true, name: true, color: true } },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Build material info
    const materialInfo: MaterialInfo = {
      id: transaction.material.id,
      code: transaction.material.code,
      name: transaction.material.name,
      serialNumber: transaction.material.serialNumber,
      partNo: transaction.material.partNo,
      category: transaction.material.materialCategory,
      unit: transaction.material.materialUnit,
      status: transaction.material.materialStatus,
    };

    // Transform events to DTOs
    const eventSteps: TransactionEventStep[] = transaction.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventDate: event.eventDate.toISOString(),
      actorName: event.actorName,
      stepOrder: event.stepOrder,
      stepTitle: event.stepTitle,
      description: event.description,
    }));

    // Build transaction DTO with events
    const transactionDto: MaterialTransactionDto = {
      id: transaction.id,
      title: transaction.title,
      status: transaction.status,
      quantity: transaction.quantity,
      referenceType: transaction.referenceType,
      referenceId: transaction.referenceId,
      counterpartyName: transaction.counterpartyName,
      outboundPurpose: transaction.outboundPurpose,
      inboundType: transaction.inboundType,
      startedAt: transaction.startedAt.toISOString(),
      completedAt: transaction.completedAt?.toISOString() ?? null,
      createdAt: transaction.createdAt.toISOString(),
      events: eventSteps,
    };

    const response: MaterialTransactionDetailResponse = {
      transaction: transactionDto,
      material: materialInfo,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching transaction detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction detail" },
      { status: 500 }
    );
  }
}
