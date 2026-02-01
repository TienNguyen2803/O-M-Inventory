import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { approverId } = body;

    // Find receipt
    const receipt = await prisma.outboundReceipt.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Check if can be approved (must be in REQUESTED status)
    if (receipt.status.code !== "REQUESTED") {
      return NextResponse.json(
        { error: "Receipt must be in REQUESTED status to approve" },
        { status: 400 }
      );
    }

    // Get APPROVED status
    const approvedStatus = await prisma.outboundStatus.findFirst({
      where: { code: "APPROVED" },
    });

    if (!approvedStatus) {
      return NextResponse.json(
        { error: "APPROVED status not found" },
        { status: 500 }
      );
    }

    // Get default approver if not provided
    let approverIdToUse = approverId;
    if (!approverIdToUse) {
      const defaultUser = await prisma.user.findFirst();
      approverIdToUse = defaultUser?.id;
    }

    // Update receipt
    const updatedReceipt = await prisma.outboundReceipt.update({
      where: { id },
      data: {
        statusId: approvedStatus.id,
        approverId: approverIdToUse,
        approvedAt: new Date(),
        step: 2,
      },
      include: {
        purpose: true,
        status: true,
        receiver: {
          select: { id: true, name: true, employeeCode: true, department: true },
        },
        approver: {
          select: { id: true, name: true, employeeCode: true },
        },
        items: {
          include: {
            material: true,
            unit: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReceipt);
  } catch (error) {
    console.error("Error approving receipt:", error);
    return NextResponse.json(
      { error: "Failed to approve receipt" },
      { status: 500 }
    );
  }
}
