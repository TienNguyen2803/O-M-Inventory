import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { inboundSchema } from "@/lib/validations/inbound";
import {
  createMaterialEventsBatch,
  buildEventDescription,
} from "@/lib/services/material-event-logging-service";
import { MaterialEventType } from "@prisma/client";

// Include relations for nested data
const includeRelations = {
  type: true,
  status: true,
  supplier: true,
  purchaseRequest: {
    select: { id: true, requestCode: true, description: true },
  },
  createdBy: {
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
  documents: {
    include: {
      type: true,
    },
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const receipt = await prisma.inboundReceipt.findUnique({
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
    const validationResult = inboundSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { items, documents, ...receiptData } = validationResult.data;

    // Check if receipt exists
    const existingReceipt = await prisma.inboundReceipt.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!existingReceipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Check if already completed (by status code)
    const newStatus = await prisma.inboundStatus.findUnique({
      where: { id: receiptData.statusId },
    });

    const isCompleting =
      existingReceipt.status.code !== "COMPLETED" &&
      newStatus?.code === "COMPLETED";

    // Prevent modifying completed receipts
    if (existingReceipt.status.code === "COMPLETED" && !isCompleting) {
      return NextResponse.json(
        { error: "Cannot modify a completed receipt." },
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
        case "KCS":
          step = 2;
          break;
        case "RECEIVING":
          step = 3;
          break;
        case "COMPLETED":
          step = 4;
          break;
      }
    }

    const itemsToCreate = items || [];
    const documentsToCreate = documents || [];

    // Update receipt with transaction for stock update on completion
    if (isCompleting) {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Receipt
        const updatedReceipt = await tx.inboundReceipt.update({
          where: { id },
          data: {
            typeId: receiptData.typeId,
            statusId: receiptData.statusId,
            supplierId: receiptData.supplierId,
            purchaseRequestId: receiptData.purchaseRequestId || null,
            referenceCode: receiptData.referenceCode || null,
            inboundDate: receiptData.inboundDate,
            notes: receiptData.notes || null,
            step: 4,
            items: {
              deleteMany: {},
              create: itemsToCreate.map((item) => ({
                materialId: item.materialId,
                unitId: item.unitId,
                locationId: item.locationId || null,
                orderedQuantity: item.orderedQuantity,
                receivedQuantity: item.receivedQuantity || 0,
                receivingQuantity: item.receivingQuantity || 0,
                serialBatch: item.serialBatch || null,
                kcs: item.kcs ?? false,
              })),
            },
            documents: {
              deleteMany: {},
              create: documentsToCreate.map((doc) => ({
                typeId: doc.typeId,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl || null,
              })),
            },
          },
          include: includeRelations,
        });

        // 2. Process Items for Stock Update
        for (const item of itemsToCreate) {
          if (item.receivingQuantity && item.receivingQuantity > 0) {
            // 2a. Update Material Stock
            await tx.material.update({
              where: { id: item.materialId },
              data: {
                stock: { increment: item.receivingQuantity },
              },
            });

            // 2b. Create/Update Warehouse Item
            if (item.locationId) {
              const existingWhItem = await tx.warehouseItem.findFirst({
                where: {
                  locationId: item.locationId,
                  materialId: item.materialId,
                },
              });

              const material = await tx.material.findUnique({
                where: { id: item.materialId },
              });

              if (existingWhItem) {
                await tx.warehouseItem.update({
                  where: { id: existingWhItem.id },
                  data: { quantity: { increment: item.receivingQuantity } },
                });
              } else if (material) {
                await tx.warehouseItem.create({
                  data: {
                    locationId: item.locationId,
                    materialId: item.materialId,
                    materialCode: material.code,
                    materialName: material.name,
                    quantity: item.receivingQuantity,
                    unitId: item.unitId,
                  },
                });
              }
            }

            // 2c. Create Inventory Log
            const material = await tx.material.findUnique({
              where: { id: item.materialId },
            });
            const supplier = await tx.supplier.findUnique({
              where: { id: receiptData.supplierId },
            });

            if (material) {
              await tx.inventoryLog.create({
                data: {
                  materialId: material.id,
                  materialName: material.name,
                  quantity: item.receivingQuantity,
                  type: "inbound",
                  date: new Date(),
                  actor: supplier?.name || "Unknown",
                },
              });
            }
          }
        }

        return updatedReceipt;
      });

      // Log INBOUND events for completed items
      try {
        const actorId = existingReceipt.createdById;
        const createdBy = await prisma.user.findUnique({
          where: { id: actorId },
          select: { name: true },
        });
        const eventInputs = itemsToCreate
          .filter((item) => item.receivingQuantity && item.receivingQuantity > 0)
          .map((item) => ({
            materialId: item.materialId,
            eventType: "INBOUND" as MaterialEventType,
            eventDate: new Date(receiptData.inboundDate),
            actorId: actorId,
            actorName: createdBy?.name ?? "Unknown",
            referenceType: "InboundReceipt",
            referenceId: id,
            referenceCode: existingReceipt.receiptCode,
            description: buildEventDescription("INBOUND", {
              referenceCode: existingReceipt.receiptCode,
              quantity: item.receivingQuantity,
            }),
            metadata: { quantity: item.receivingQuantity },
          }));
        if (eventInputs.length > 0) {
          await createMaterialEventsBatch(eventInputs);
        }
      } catch (eventError) {
        console.error("Failed to log INBOUND events:", eventError);
      }

      return NextResponse.json(result);
    } else {
      // Normal Update (Not completing)
      const updatedReceipt = await prisma.inboundReceipt.update({
        where: { id },
        data: {
          typeId: receiptData.typeId,
          statusId: receiptData.statusId,
          supplierId: receiptData.supplierId,
          purchaseRequestId: receiptData.purchaseRequestId || null,
          referenceCode: receiptData.referenceCode || null,
          inboundDate: receiptData.inboundDate,
          notes: receiptData.notes || null,
          step,
          items: {
            deleteMany: {},
            create: itemsToCreate.map((item) => ({
              materialId: item.materialId,
              unitId: item.unitId,
              locationId: item.locationId || null,
              orderedQuantity: item.orderedQuantity,
              receivedQuantity: item.receivedQuantity || 0,
              receivingQuantity: item.receivingQuantity || 0,
              serialBatch: item.serialBatch || null,
              kcs: item.kcs ?? false,
            })),
          },
          documents: {
            deleteMany: {},
            create: documentsToCreate.map((doc) => ({
              typeId: doc.typeId,
              fileName: doc.fileName,
              fileUrl: doc.fileUrl || null,
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
    const receipt = await prisma.inboundReceipt.findUnique({
      where: { id },
      include: { status: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (receipt.status.code === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot delete completed receipt" },
        { status: 400 }
      );
    }

    await prisma.inboundReceipt.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
