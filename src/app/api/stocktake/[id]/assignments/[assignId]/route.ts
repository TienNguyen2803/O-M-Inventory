import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stocktakeAssignmentSchema } from "@/lib/validations/stocktake";

type RouteParams = { params: Promise<{ id: string; assignId: string }> };

// Include relations for nested data
const includeRelations = {
  location: { select: { id: true, code: true, name: true } },
  assignee: { select: { id: true, name: true, employeeCode: true } },
  status: true,
};

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id, assignId } = await params;

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

    // Check if assignment exists
    const existing = await prisma.stocktakeAssignment.findUnique({
      where: { id: assignId, stocktakeId: id },
      include: { stocktake: { include: { status: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const updatedAssignment = await prisma.stocktakeAssignment.update({
      where: { id: assignId },
      data: {
        assigneeId: validationResult.data.assigneeId,
        statusId: validationResult.data.statusId,
        completedAt:
          validationResult.data.statusId &&
          (await prisma.stocktakeAssignmentStatus.findUnique({
            where: { id: validationResult.data.statusId },
          }))?.code === "COMPLETED"
            ? new Date()
            : undefined,
      },
      include: includeRelations,
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id, assignId } = await params;

  try {
    // Check if assignment exists and stocktake is in DRAFT status
    const existing = await prisma.stocktakeAssignment.findUnique({
      where: { id: assignId, stocktakeId: id },
      include: { stocktake: { include: { status: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (existing.stocktake.status.code !== "DRAFT") {
      return NextResponse.json(
        { error: "Chỉ có thể xóa phân công khi đợt kiểm kê ở trạng thái Nháp" },
        { status: 400 }
      );
    }

    await prisma.stocktakeAssignment.delete({
      where: { id: assignId },
    });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
