import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inboundSchema } from "@/lib/validations/inbound";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receipt = await prisma.inboundReceipt.findUnique({
      where: { id },
      include: {
        items: true,
        documents: true,
      },
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
    const validationResult = inboundSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { items, ...receiptData } = validationResult.data;

    // Check current status
    const existingReceipt = await prisma.inboundReceipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingReceipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Check if we are transitioning to 'Hoàn thành' from non-completed state
    const isCompleting =
      existingReceipt.status !== "Hoàn thành" &&
      receiptData.status === "Hoàn thành";

    // If already completed, prevent changes
    if (existingReceipt.status === "Hoàn thành" && !isCompleting) {
        return NextResponse.json(
            { error: "Cannot modify a completed receipt." },
            { status: 400 }
        );
    }

    if (isCompleting) {
      // Execute Transaction
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Receipt
        const updatedReceipt = await tx.inboundReceipt.update({
          where: { id },
          data: {
            ...receiptData,
            step: 4, // Completed step
            items: {
                deleteMany: {},
                create: items?.map((item) => ({
                    materialCode: item.materialCode,
                    materialName: item.materialName,
                    orderedQuantity: item.orderedQuantity,
                    receivedQuantity: item.receivedQuantity,
                    receivingQuantity: item.receivingQuantity,
                    serialBatch: item.serialBatch,
                    location: item.location,
                    kcs: item.kcs ?? false,
                })) || [],
            }
          },
          include: { items: true },
        });

        // 2. Process Items for Stock Update
        if (items && items.length > 0) {
          for (const item of items) {
             if (item.receivingQuantity > 0) {
                 // 2a. Find Material
                 const material = await tx.material.findUnique({
                     where: { code: item.materialCode }
                 });

                 if (material) {
                     // 2b. Update Stock
                     await tx.material.update({
                         where: { id: material.id },
                         data: {
                             stock: { increment: item.receivingQuantity }
                         }
                     });

                     // 2c. Create/Update Warehouse Item
                     if (item.location) {
                         const location = await tx.warehouseLocation.findUnique({
                             where: { code: item.location }
                         });

                         if (location) {
                             // Check if item exists in this location
                             const existingWhItem = await tx.warehouseItem.findFirst({
                                 where: {
                                     locationId: location.id,
                                     materialId: material.id
                                 }
                             });

                             if (existingWhItem) {
                                 await tx.warehouseItem.update({
                                     where: { id: existingWhItem.id },
                                     data: { quantity: { increment: item.receivingQuantity } }
                                 });
                             } else {
                                 await tx.warehouseItem.create({
                                     data: {
                                         locationId: location.id,
                                         materialId: material.id,
                                         materialCode: material.code,
                                         materialName: material.name,
                                         quantity: item.receivingQuantity,
                                         unitId: material.unitId, // Use FK relation to MaterialUnit
                                     }
                                 });
                             }
                         }
                     }

                     // 2d. Create Inventory Log
                     await tx.inventoryLog.create({
                         data: {
                             materialId: material.id,
                             materialName: material.name,
                             quantity: item.receivingQuantity,
                             type: "inbound",
                             date: new Date(),
                             actor: receiptData.partner || "Unknown",
                         }
                     });
                 }
             }
          }
        }

        return updatedReceipt;
      });

      return NextResponse.json(result);

    } else {
      // Normal Update (Not completing)
      const updatedReceipt = await prisma.inboundReceipt.update({
        where: { id },
        data: {
            ...receiptData,
            step: receiptData.status === 'Đang nhập' ? 2 : receiptData.status === 'KCS & Hồ sơ' ? 3 : 1,
            items: {
                deleteMany: {},
                create: items?.map((item) => ({
                    materialCode: item.materialCode,
                    materialName: item.materialName,
                    orderedQuantity: item.orderedQuantity,
                    receivedQuantity: item.receivedQuantity,
                    receivingQuantity: item.receivingQuantity,
                    serialBatch: item.serialBatch,
                    location: item.location,
                    kcs: item.kcs ?? false,
                })) || [],
            }
        },
        include: { items: true },
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
        const receipt = await prisma.inboundReceipt.findUnique({ where: { id }});

        if (!receipt) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (receipt.status === 'Hoàn thành') {
            return NextResponse.json({ error: "Cannot delete completed receipt" }, { status: 400 });
        }

        await prisma.inboundReceipt.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
