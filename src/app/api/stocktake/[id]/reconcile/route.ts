import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteParams = { params: Promise<{ id: string }> };

// Start reconciliation - transition from COUNTING to RECONCILING (step 2 -> 3)
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Get stocktake with status
    const stocktake = await prisma.stocktake.findUnique({
      where: { id },
      include: {
        status: true,
        assignments: { include: { status: true } },
        results: true,
      },
    });

    if (!stocktake) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    // Validate step transition - must be in COUNTING (step 2)
    if (stocktake.status.code !== "COUNTING") {
      return NextResponse.json(
        { error: "Chỉ có thể bắt đầu đối soát từ trạng thái Đang kiểm đếm" },
        { status: 400 }
      );
    }

    // Check all assignments are completed
    const incompleteAssignments = stocktake.assignments.filter(
      (a) => a.status.code !== "COMPLETED"
    );
    if (incompleteAssignments.length > 0) {
      return NextResponse.json(
        {
          error: `Còn ${incompleteAssignments.length} vị trí chưa hoàn thành kiểm đếm`,
        },
        { status: 400 }
      );
    }

    // Get RECONCILING status
    const reconcilingStatus = await prisma.stocktakeStatus.findUnique({
      where: { code: "RECONCILING" },
    });
    if (!reconcilingStatus) {
      return NextResponse.json(
        { error: "RECONCILING status not found" },
        { status: 500 }
      );
    }

    // Update stocktake status to RECONCILING
    const updatedStocktake = await prisma.stocktake.update({
      where: { id },
      data: { statusId: reconcilingStatus.id },
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

    return NextResponse.json({
      ...updatedStocktake,
      currentStep: updatedStocktake.status.sortOrder,
      message: "Đã bắt đầu đối soát",
    });
  } catch (error) {
    console.error("Error reconciling stocktake:", error);
    return NextResponse.json(
      { error: "Failed to start reconciliation" },
      { status: 500 }
    );
  }
}
