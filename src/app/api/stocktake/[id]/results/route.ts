import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  stocktakeResultSchema,
  stocktakeBulkResultSchema,
} from "@/lib/validations/stocktake";

type RouteParams = { params: Promise<{ id: string }> };

// Include relations for nested data
const includeRelations = {
  material: { select: { id: true, code: true, name: true } },
  location: { select: { id: true, code: true, name: true } },
  unit: { select: { id: true, code: true, name: true } },
  countedBy: { select: { id: true, name: true } },
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const locationId = searchParams.get("locationId");

  try {
    const where = {
      stocktakeId: id,
      ...(locationId && locationId !== "all" ? { locationId } : {}),
    };

    const results = await prisma.stocktakeResult.findMany({
      where,
      include: includeRelations,
      orderBy: [{ location: { code: "asc" } }, { material: { code: "asc" } }],
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}

// Single result update with optimistic locking
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();

    // Validate body
    const validationResult = stocktakeResultSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    if (!data.id) {
      return NextResponse.json(
        { error: "Result ID is required for update" },
        { status: 400 }
      );
    }

    // Check if result exists
    const existing = await prisma.stocktakeResult.findUnique({
      where: { id: data.id, stocktakeId: id },
      include: { stocktake: { include: { status: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Result not found" },
        { status: 404 }
      );
    }

    // Only allow updating in COUNTING or RECONCILING status
    if (
      existing.stocktake.status.code !== "COUNTING" &&
      existing.stocktake.status.code !== "RECONCILING"
    ) {
      return NextResponse.json(
        {
          error:
            "Chỉ có thể cập nhật kết quả khi đợt kiểm kê đang kiểm đếm hoặc đối soát",
        },
        { status: 400 }
      );
    }

    // Optimistic locking check
    if (data.updatedAt) {
      const expectedUpdatedAt = new Date(data.updatedAt);
      if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
        return NextResponse.json(
          {
            error:
              "CONFLICT: Kết quả đã được cập nhật bởi người khác. Vui lòng tải lại và thử lại.",
            code: "CONFLICT",
          },
          { status: 409 }
        );
      }
    }

    // Calculate variance
    const variance = data.actualQuantity - existing.bookQuantity;

    const updatedResult = await prisma.stocktakeResult.update({
      where: { id: data.id },
      data: {
        actualQuantity: data.actualQuantity,
        variance,
        serialBatch: data.serialBatch || null,
        notes: data.notes || null,
      },
      include: includeRelations,
    });

    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      { error: "Failed to update result" },
      { status: 500 }
    );
  }
}

// Bulk update results (max 50 items) with all-or-nothing transaction
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();

    // Validate body
    const validationResult = stocktakeBulkResultSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { results } = validationResult.data;

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No results to update" },
        { status: 400 }
      );
    }

    // Check stocktake status
    const stocktake = await prisma.stocktake.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!stocktake) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    if (
      stocktake.status.code !== "COUNTING" &&
      stocktake.status.code !== "RECONCILING"
    ) {
      return NextResponse.json(
        {
          error:
            "Chỉ có thể cập nhật kết quả khi đợt kiểm kê đang kiểm đếm hoặc đối soát",
        },
        { status: 400 }
      );
    }

    // Use transaction for all-or-nothing update
    const updatedResults = await prisma.$transaction(async (tx) => {
      const updated = [];

      for (const result of results) {
        if (!result.id) {
          throw new Error("Result ID is required for update");
        }

        // Get existing result
        const existing = await tx.stocktakeResult.findUnique({
          where: { id: result.id, stocktakeId: id },
        });

        if (!existing) {
          throw new Error(`Result ${result.id} not found`);
        }

        // Optimistic locking check
        if (result.updatedAt) {
          const expectedUpdatedAt = new Date(result.updatedAt);
          if (existing.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
            throw new Error(
              `CONFLICT: Result for material was modified by another user`
            );
          }
        }

        // Calculate variance
        const variance = result.actualQuantity - existing.bookQuantity;

        const updatedResult = await tx.stocktakeResult.update({
          where: { id: result.id },
          data: {
            actualQuantity: result.actualQuantity,
            variance,
            serialBatch: result.serialBatch || null,
            notes: result.notes || null,
          },
          include: includeRelations,
        });

        updated.push(updatedResult);
      }

      return updated;
    });

    return NextResponse.json({
      message: `Đã cập nhật ${updatedResults.length} kết quả`,
      results: updatedResults,
    });
  } catch (error) {
    console.error("Error bulk updating results:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update results";
    const isConflict = message.includes("CONFLICT");

    return NextResponse.json(
      { error: message, code: isConflict ? "CONFLICT" : undefined },
      { status: isConflict ? 409 : 500 }
    );
  }
}
