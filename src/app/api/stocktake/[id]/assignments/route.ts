import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stocktakeAssignmentSchema } from "@/lib/validations/stocktake";

type RouteParams = { params: Promise<{ id: string }> };

// Include relations for nested data
const includeRelations = {
  location: { select: { id: true, code: true, name: true } },
  assignee: { select: { id: true, name: true, employeeCode: true } },
  status: true,
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const assignments = await prisma.stocktakeAssignment.findMany({
      where: { stocktakeId: id },
      include: includeRelations,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await req.json();

    // Validate body
    const validationResult = stocktakeAssignmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Check if stocktake exists and is in DRAFT status
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

    if (stocktake.status.code !== "DRAFT") {
      return NextResponse.json(
        { error: "Chỉ có thể thêm phân công khi đợt kiểm kê ở trạng thái Nháp" },
        { status: 400 }
      );
    }

    // Check if location already assigned
    const existingAssignment = await prisma.stocktakeAssignment.findUnique({
      where: {
        stocktakeId_locationId: {
          stocktakeId: id,
          locationId: validationResult.data.locationId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Vị trí này đã được phân công" },
        { status: 400 }
      );
    }

    // Get PENDING assignment status
    const pendingStatus = await prisma.stocktakeAssignmentStatus.findUnique({
      where: { code: "PENDING" },
    });
    if (!pendingStatus) {
      return NextResponse.json(
        { error: "PENDING status not found" },
        { status: 500 }
      );
    }

    const newAssignment = await prisma.stocktakeAssignment.create({
      data: {
        stocktakeId: id,
        locationId: validationResult.data.locationId,
        assigneeId: validationResult.data.assigneeId,
        statusId: validationResult.data.statusId || pendingStatus.id,
      },
      include: includeRelations,
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
