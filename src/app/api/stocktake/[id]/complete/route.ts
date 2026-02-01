import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// Complete stocktake - transition from RECONCILING to COMPLETED (step 3 -> 4)
// This updates warehouse stock based on actual quantities
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Get stocktake with results
    const stocktake = await prisma.stocktake.findUnique({
      where: { id },
      include: {
        status: true,
        results: {
          where: { variance: { not: 0 } },
          include: { material: true, location: true },
        },
      },
    });

    if (!stocktake) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    // Validate step transition - must be in RECONCILING (step 3)
    if (stocktake.status.code !== "RECONCILING") {
      return NextResponse.json(
        { error: "Chỉ có thể hoàn thành từ trạng thái Đang đối soát" },
        { status: 400 }
      );
    }

    // Get COMPLETED status
    const completedStatus = await prisma.stocktakeStatus.findUnique({
      where: { code: "COMPLETED" },
    });
    if (!completedStatus) {
      return NextResponse.json(
        { error: "COMPLETED status not found" },
        { status: 500 }
      );
    }

    // Use transaction for ALL-OR-NOTHING atomicity
    const updatedStocktake = await prisma.$transaction(async (tx) => {
      // Update stock for each result with variance
      for (const result of stocktake.results) {
        // CHECK WarehouseItem exists - ERROR if not (no auto-create)
        const warehouseItem = await tx.warehouseItem.findFirst({
          where: {
            locationId: result.locationId,
            materialId: result.materialId,
          },
        });

        if (!warehouseItem) {
          throw new Error(
            `WarehouseItem không tồn tại cho ${result.material.name} tại ${result.location.code}. ` +
              `Vui lòng nhập kho trước khi kiểm kê.`
          );
        }

        // Update existing WarehouseItem quantity
        await tx.warehouseItem.update({
          where: { id: warehouseItem.id },
          data: { quantity: result.actualQuantity },
        });

        // ATOMIC SQL for Material stock update (race condition prevention)
        await tx.$executeRaw`
          UPDATE "materials"
          SET stock = (
            SELECT COALESCE(SUM(quantity), 0)::int
            FROM "warehouse_items"
            WHERE "materialId" = ${result.materialId}
          )
          WHERE id = ${result.materialId}
        `;

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            materialId: result.materialId,
            materialName: result.material.name,
            quantity: result.variance,
            type: result.variance > 0 ? "adjustment_in" : "adjustment_out",
            date: new Date(),
            actor: "Stocktake System",
          },
        });
      }

      // Update stocktake status to COMPLETED
      return tx.stocktake.update({
        where: { id },
        data: {
          statusId: completedStatus.id,
          completedAt: new Date(),
        },
        include: {
          status: true,
          area: true,
          createdBy: { select: { id: true, name: true, employeeCode: true } },
          assignments: {
            include: {
              location: { select: { id: true, code: true, name: true } },
              assignee: {
                select: { id: true, name: true, employeeCode: true },
              },
              status: true,
            },
          },
          results: {
            include: {
              material: { select: { id: true, code: true, name: true } },
              location: { select: { id: true, code: true, name: true } },
              unit: { select: { id: true, code: true, name: true } },
              countedBy: { select: { id: true, name: true } },
            },
          },
        },
      });
    });

    return NextResponse.json({
      ...updatedStocktake,
      currentStep: updatedStocktake.status.sortOrder,
      message: "Đã hoàn thành kiểm kê và cập nhật tồn kho",
    });
  } catch (error) {
    console.error("Error completing stocktake:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete stocktake",
      },
      { status: 500 }
    );
  }
}
