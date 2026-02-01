import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { outboundSchema } from "@/lib/validations/outbound";
import { Prisma } from "@prisma/client";

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

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const query = searchParams.get("query") || "";
  const purposeId = searchParams.get("purposeId");
  const statusId = searchParams.get("statusId");

  const where: Prisma.OutboundReceiptWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { receiptCode: { contains: query, mode: "insensitive" } },
              { receiver: { name: { contains: query, mode: "insensitive" } } },
              { receiver: { department: { name: { contains: query, mode: "insensitive" } } } },
              { reason: { contains: query, mode: "insensitive" } },
              { materialRequest: { requestCode: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      purposeId && purposeId !== "all" ? { purposeId } : {},
      statusId && statusId !== "all" ? { statusId } : {},
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.outboundReceipt.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: includeRelations,
      }),
      prisma.outboundReceipt.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error("Error fetching outbound receipts:", error);
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
    const validationResult = outboundSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { items, ...receiptData } = validationResult.data;

    // Get default user (first user for now - should be replaced with auth)
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      return NextResponse.json(
        { error: "No user found for createdBy" },
        { status: 400 }
      );
    }

    const itemsToCreate = items || [];

    // Use transaction for atomic receipt code generation + create
    const newReceipt = await prisma.$transaction(async (tx) => {
      // Generate receiptCode if not provided (inside transaction to avoid race condition)
      let receiptCode = receiptData.receiptCode;
      if (!receiptCode) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const prefix = `PXK-${year}${month}`;
        const count = await tx.outboundReceipt.count({
          where: { receiptCode: { startsWith: prefix } },
        });
        receiptCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;
      }

      return tx.outboundReceipt.create({
        data: {
          receiptCode,
          purposeId: receiptData.purposeId,
          statusId: receiptData.statusId,
          receiverId: receiptData.receiverId,
          materialRequestId: receiptData.materialRequestId || null,
          createdById: receiptData.createdById || defaultUser.id,
          approverId: receiptData.approverId || null,
          reason: receiptData.reason || null,
          outboundDate: receiptData.outboundDate,
          approvedAt: receiptData.approvedAt || null,
          issuedAt: receiptData.issuedAt || null,
          notes: receiptData.notes || null,
          step: receiptData.step || 1,
          items: {
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
    });

    return NextResponse.json(newReceipt, { status: 201 });
  } catch (error) {
    console.error("Error creating outbound receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}
