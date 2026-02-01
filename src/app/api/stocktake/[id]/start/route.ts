import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// Start counting - transition from DRAFT to COUNTING (step 1 -> 2)
// This populates StocktakeResults with book quantities from WarehouseItems
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Get stocktake with assignments
    const stocktake = await prisma.stocktake.findUnique({
      where: { id },
      include: {
        status: true,
        assignments: true,
      },
    });

    if (!stocktake) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    // Validate step transition - must be in DRAFT (step 1)
    if (stocktake.status.code !== "DRAFT") {
      return NextResponse.json(
        { error: "Chỉ có thể bắt đầu kiểm đếm từ trạng thái Nháp" },
        { status: 400 }
      );
    }

    // Must have at least one assignment
    if (stocktake.assignments.length === 0) {
      return NextResponse.json(
        { error: "Phải có ít nhất một vị trí được phân công trước khi bắt đầu" },
        { status: 400 }
      );
    }

    // Get COUNTING status
    const countingStatus = await prisma.stocktakeStatus.findUnique({
      where: { code: "COUNTING" },
    });
    if (!countingStatus) {
      return NextResponse.json(
        { error: "COUNTING status not found" },
        { status: 500 }
      );
    }

    // Get COUNTING assignment status
    const countingAssignmentStatus =
      await prisma.stocktakeAssignmentStatus.findUnique({
        where: { code: "COUNTING" },
      });
    if (!countingAssignmentStatus) {
      return NextResponse.json(
        { error: "COUNTING assignment status not found" },
        { status: 500 }
      );
    }

    // Use transaction to update status and populate results
    const updatedStocktake = await prisma.$transaction(async (tx) => {
      // Populate results with book quantities from WarehouseItems
      for (const assignment of stocktake.assignments) {
        // Get all warehouse items at this location
        const warehouseItems = await tx.warehouseItem.findMany({
          where: { locationId: assignment.locationId },
          include: { location: true },
        });

        for (const item of warehouseItems) {
          // Get material to get unitId
          const material = await tx.material.findUnique({
            where: { id: item.materialId },
          });

          if (!material?.unitId) {
            throw new Error(
              `Material ${item.materialId} has no unit assigned`
            );
          }

          // Create result with book quantity snapshot
          await tx.stocktakeResult.create({
            data: {
              stocktakeId: id,
              materialId: item.materialId,
              locationId: item.locationId,
              unitId: material.unitId,
              countedById: assignment.assigneeId,
              bookQuantity: item.quantity, // SNAPSHOT at this moment
              actualQuantity: 0, // User fills in
              variance: 0, // Auto-calculated later
            },
          });
        }

        // Update assignment status to COUNTING
        await tx.stocktakeAssignment.update({
          where: { id: assignment.id },
          data: { statusId: countingAssignmentStatus.id },
        });
      }

      // Update stocktake status to COUNTING
      return tx.stocktake.update({
        where: { id },
        data: { statusId: countingStatus.id },
        include: {
          status: true,
          area: true,
          createdBy: { select: { id: true, name: true, employeeCode: true } },
          assignments: {
            include: {
              location: { select: { id: true, code: true, name: true } },
              assignee: { select: { id: true, name: true, employeeCode: true } },
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
      message: "Đã bắt đầu kiểm đếm",
    });
  } catch (error) {
    console.error("Error starting stocktake:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to start stocktake",
      },
      { status: 500 }
    );
  }
}
