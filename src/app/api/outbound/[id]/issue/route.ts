import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find receipt with items
    const receipt = await prisma.outboundReceipt.findUnique({
      where: { id },
      include: {
        status: true,
        items: true,
        receiver: {
          include: { department: true },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Check if can be issued (must be in PICKING or APPROVED status)
    if (!["PICKING", "APPROVED"].includes(receipt.status.code)) {
      return NextResponse.json(
        { error: "Receipt must be in PICKING or APPROVED status to issue" },
        { status: 400 }
      );
    }

    // Get ISSUED status
    const issuedStatus = await prisma.outboundStatus.findFirst({
      where: { code: "ISSUED" },
    });

    if (!issuedStatus) {
      return NextResponse.json(
        { error: "ISSUED status not found" },
        { status: 500 }
      );
    }

    // Validate stock availability before issuing
    for (const item of receipt.items) {
      if (item.issuedQuantity > 0) {
        const material = await prisma.material.findUnique({
          where: { id: item.materialId },
          select: { id: true, code: true, name: true, stock: true },
        });
        if (material && material.stock < item.issuedQuantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${material.name} (${material.code}). Available: ${material.stock}, Requested: ${item.issuedQuantity}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Transaction: update receipt + decrement stock + create inventory logs
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Receipt status
      const updatedReceipt = await tx.outboundReceipt.update({
        where: { id },
        data: {
          statusId: issuedStatus.id,
          issuedAt: new Date(),
          step: 4,
        },
      });

      // 2. Process each item for stock update
      for (const item of receipt.items) {
        if (item.issuedQuantity > 0) {
          // 2a. Decrement Material Stock
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

          if (material) {
            await tx.inventoryLog.create({
              data: {
                materialId: material.id,
                materialName: material.name,
                quantity: item.issuedQuantity,
                type: "outbound",
                date: new Date(),
                actor: receipt.receiver?.department?.name || receipt.receiver?.name || "Unknown",
              },
            });
          }
        }
      }

      return updatedReceipt;
    });

    // Fetch full receipt with relations
    const fullReceipt = await prisma.outboundReceipt.findUnique({
      where: { id: result.id },
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

    return NextResponse.json(fullReceipt);
  } catch (error) {
    console.error("Error issuing receipt:", error);
    return NextResponse.json(
      { error: "Failed to issue receipt" },
      { status: 500 }
    );
  }
}
