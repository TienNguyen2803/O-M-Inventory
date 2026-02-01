import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outboundSchema } from "@/lib/validations/outbound";

// Include relations for nested data
const includeRelations = {
  purpose: true,
  status: true,
  receiver: {
    select: { id: true, name: true, employeeCode: true, department: true },
  },
  materialRequest: {
    select: { id: true, requestCode: true },
  },
  createdBy: {
    select: { id: true, name: true, employeeCode: true },
  },
  approver: {
    select: { id: true, name: true, employeeCode: true },
  },
  items: {
    include: {
      material: {
        select: { id: true, code: true, name: true, partNo: true, stock: true },
      },
      unit: true,
      location: {
        select: { id: true, code: true, name: true },
      },
    },
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receipt = await prisma.outboundReceipt.findUnique({
      where: { id },
      include: includeRelations,
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate body
    const validationResult = outboundSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { items, ...receiptData } = validationResult.data;

    // Check if receipt exists
    const existingReceipt = await prisma.outboundReceipt.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!existingReceipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Check status for workflow
    const newStatus = await prisma.outboundStatus.findUnique({
      where: { id: receiptData.statusId },
    });

    const isIssuing =
      existingReceipt.status.code !== "ISSUED" &&
      newStatus?.code === "ISSUED";

    // Prevent modifying issued receipts (except for special cases)
    if (existingReceipt.status.code === "ISSUED" && !isIssuing) {
      return NextResponse.json(
        { error: "Cannot modify an issued receipt." },
        { status: 400 }
      );
    }

    // Determine step based on status
    let step = receiptData.step || existingReceipt.step;
    if (newStatus) {
      switch (newStatus.code) {
        case "DRAFT":
        case "REQUESTED":
          step = 1;
          break;
        case "APPROVED":
          step = 2;
          break;
        case "PICKING":
          step = 3;
          break;
        case "ISSUED":
          step = 4;
          break;
        case "REJECTED":
        case "CANCELLED":
          step = 1;
          break;
      }
    }

    const itemsToCreate = items || [];

    // Update receipt with transaction for stock update on issue
    if (isIssuing) {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Receipt
        const updatedReceipt = await tx.outboundReceipt.update({
          where: { id },
          data: {
            purposeId: receiptData.purposeId,
            statusId: receiptData.statusId,
            receiverId: receiptData.receiverId,
            materialRequestId: receiptData.materialRequestId || null,
            approverId: receiptData.approverId || null,
            reason: receiptData.reason || null,
            outboundDate: receiptData.outboundDate,
            approvedAt: receiptData.approvedAt || null,
            issuedAt: new Date(), // Set issued timestamp
            notes: receiptData.notes || null,
            step: 4,
            items: {
              deleteMany: {},
              create: itemsToCreate.map((item) => ({
                materialId: item.materialId,
                unitId: item.unitId,
                locationId: item.locationId || null,
                requestedQuantity: item.requestedQuantity,
                issuedQuantity: item.issuedQuantity || 0,
                serialBatch: item.serialBatch || null,
              })),
            },
          },
          include: includeRelations,
        });

        // 2. Process Items for Stock Update (decrement)
        for (const item of itemsToCreate) {
          if (item.issuedQuantity && item.issuedQuantity > 0) {
            // 2a. Update Material Stock (decrement)
            await tx.material.update({
              where: { id: item.materialId },
              data: {
                stock: { decrement: item.issuedQuantity },
              },
            });

            // 2b. Update Warehouse Item if location specified
            if (item.locationId) {
              const existingWhItem = await tx.warehouseItem.findFirst({
                where: {
                  locationId: item.locationId,
                  materialId: item.materialId,
                },
              });

              if (existingWhItem) {
                const newQty = existingWhItem.quantity - item.issuedQuantity;
                if (newQty <= 0) {
                  await tx.warehouseItem.delete({
                    where: { id: existingWhItem.id },
                  });
                } else {
                  await tx.warehouseItem.update({
                    where: { id: existingWhItem.id },
                    data: { quantity: { decrement: item.issuedQuantity } },
                  });
                }
              }
            }

            // 2c. Create Inventory Log
            const material = await tx.material.findUnique({
              where: { id: item.materialId },
            });
            const receiver = await tx.user.findUnique({
              where: { id: receiptData.receiverId },
              include: { department: true },
            });

            if (material) {
              await tx.inventoryLog.create({
                data: {
                  materialId: material.id,
                  materialName: material.name,
                  quantity: item.issuedQuantity,
                  type: "outbound",
                  date: new Date(),
                  actor: receiver?.department?.name || receiver?.name || "Unknown",
                },
              });
            }
          }
        }

        return updatedReceipt;
      });

      return NextResponse.json(result);
    } else {
      // Normal Update (Not issuing)
      const updatedReceipt = await prisma.outboundReceipt.update({
        where: { id },
        data: {
          purposeId: receiptData.purposeId,
          statusId: receiptData.statusId,
          receiverId: receiptData.receiverId,
          materialRequestId: receiptData.materialRequestId || null,
          approverId: receiptData.approverId || null,
          reason: receiptData.reason || null,
          outboundDate: receiptData.outboundDate,
          approvedAt: receiptData.approvedAt || null,
          issuedAt: receiptData.issuedAt || null,
          notes: receiptData.notes || null,
          step,
          items: {
            deleteMany: {},
            create: itemsToCreate.map((item) => ({
              materialId: item.materialId,
              unitId: item.unitId,
              locationId: item.locationId || null,
              requestedQuantity: item.requestedQuantity,
              issuedQuantity: item.issuedQuantity || 0,
              serialBatch: item.serialBatch || null,
            })),
          },
        },
        include: includeRelations,
      });

      return NextResponse.json(updatedReceipt);
    }
  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receipt = await prisma.outboundReceipt.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (receipt.status.code === "ISSUED") {
      return NextResponse.json(
        { error: "Cannot delete issued receipt" },
        { status: 400 }
      );
    }

    await prisma.outboundReceipt.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
