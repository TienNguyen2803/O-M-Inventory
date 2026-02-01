import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stocktakeSchema } from "@/lib/validations/stocktake";

// Include relations for nested data
const includeRelations = {
  status: true,
  area: true,
  createdBy: {
    select: { id: true, name: true, employeeCode: true },
  },
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
};

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const stocktake = await prisma.stocktake.findUnique({
      where: { id },
      include: includeRelations,
    });

    if (!stocktake) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    // Add computed fields
    const transformedData = {
      ...stocktake,
      currentStep: stocktake.status.sortOrder,
      totalLocations: stocktake.assignments.length,
      completedLocations: stocktake.assignments.filter(
        (a) => a.status.code === "COMPLETED"
      ).length,
      totalVariance: stocktake.results.reduce((sum, r) => sum + r.variance, 0),
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching stocktake:", error);
    return NextResponse.json(
      { error: "Failed to fetch stocktake" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();

    // Validate body
    const validationResult = stocktakeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Check if stocktake exists
    const existing = await prisma.stocktake.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    // Only allow editing DRAFT stocktakes
    if (existing.status.code !== "DRAFT") {
      return NextResponse.json(
        { error: "Chỉ có thể sửa đợt kiểm kê ở trạng thái Nháp" },
        { status: 400 }
      );
    }

    const { assignments, ...stocktakeData } = validationResult.data;

    const updatedStocktake = await prisma.stocktake.update({
      where: { id },
      data: {
        name: stocktakeData.name,
        areaId: stocktakeData.areaId,
        takeDate: stocktakeData.takeDate,
        notes: stocktakeData.notes || null,
      },
      include: includeRelations,
    });

    return NextResponse.json(updatedStocktake);
  } catch (error) {
    console.error("Error updating stocktake:", error);
    return NextResponse.json(
      { error: "Failed to update stocktake" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Check if stocktake exists and get status
    const existing = await prisma.stocktake.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Stocktake not found" },
        { status: 404 }
      );
    }

    // Only allow deleting DRAFT or CANCELLED stocktakes
    if (
      existing.status.code !== "DRAFT" &&
      existing.status.code !== "CANCELLED"
    ) {
      return NextResponse.json(
        { error: "Chỉ có thể xóa đợt kiểm kê ở trạng thái Nháp hoặc Đã hủy" },
        { status: 400 }
      );
    }

    await prisma.stocktake.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Stocktake deleted successfully" });
  } catch (error) {
    console.error("Error deleting stocktake:", error);
    return NextResponse.json(
      { error: "Failed to delete stocktake" },
      { status: 500 }
    );
  }
}
