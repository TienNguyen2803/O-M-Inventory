import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inboundSchema } from "@/lib/validations/inbound";
import { Prisma } from "@prisma/client";

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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const query = searchParams.get("query") || "";
  const typeId = searchParams.get("typeId");
  const statusId = searchParams.get("statusId");

  const where: Prisma.InboundReceiptWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { receiptCode: { contains: query, mode: "insensitive" } },
              { supplier: { name: { contains: query, mode: "insensitive" } } },
              { referenceCode: { contains: query, mode: "insensitive" } },
              { purchaseRequest: { requestCode: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      typeId && typeId !== "all" ? { typeId } : {},
      statusId && statusId !== "all" ? { statusId } : {},
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.inboundReceipt.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: includeRelations,
      }),
      prisma.inboundReceipt.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Error fetching inbound receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Generate receiptCode if not provided
    let receiptCode = receiptData.receiptCode;
    if (!receiptCode) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const count = await prisma.inboundReceipt.count({
        where: {
          receiptCode: { startsWith: `PNK-${year}${month}` },
        },
      });
      receiptCode = `PNK-${year}${month}-${String(count + 1).padStart(3, "0")}`;
    }

    // Get default user (first user for now - should be replaced with auth)
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      return NextResponse.json(
        { error: "No user found for createdBy" },
        { status: 400 }
      );
    }

    const itemsToCreate = items || [];
    const documentsToCreate = documents || [];

    const newReceipt = await prisma.inboundReceipt.create({
      data: {
        receiptCode,
        typeId: receiptData.typeId,
        statusId: receiptData.statusId,
        supplierId: receiptData.supplierId,
        purchaseRequestId: receiptData.purchaseRequestId || null,
        createdById: receiptData.createdById || defaultUser.id,
        referenceCode: receiptData.referenceCode || null,
        inboundDate: receiptData.inboundDate,
        notes: receiptData.notes || null,
        step: receiptData.step || 1,
        items: {
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
          create: documentsToCreate.map((doc) => ({
            typeId: doc.typeId,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl || null,
          })),
        },
      },
      include: includeRelations,
    });

    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error("Error creating inbound receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}
