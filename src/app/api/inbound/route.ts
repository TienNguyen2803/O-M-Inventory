import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inboundSchema } from "@/lib/validations/inbound";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  const where: Prisma.InboundReceiptWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { receiptCode: { contains: query, mode: "insensitive" } },
              { partner: { contains: query, mode: "insensitive" } },
              { reference: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      type && type !== "all" ? { inboundType: type } : {},
      status && status !== "all" ? { status: status } : {},
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.inboundReceipt.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          documents: true,
        },
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

    const { items, ...receiptData } = validationResult.data;

    // Generate receiptCode if not provided
    // For simplicity, we can use a timestamp or a sequence if we had one.
    // Or let Prisma ID handle UUID, and generate a readable code like PNK-YYYY-MM-XXXX
    // Here we'll generate one if not present.
    let receiptCode = receiptData.receiptCode;
    if (!receiptCode) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      receiptCode = `PNK-${year}${month}-${random}`;
    }

    // Ensure items is defined (zod default or optional)
    const itemsToCreate = items || [];

    const newReceipt = await prisma.inboundReceipt.create({
      data: {
        receiptCode,
        inboundType: receiptData.inboundType,
        reference: receiptData.reference,
        inboundDate: receiptData.inboundDate,
        partner: receiptData.partner,
        status: receiptData.status,
        step: receiptData.status === "Hoàn thành" ? 4 : 1, // Simple step logic
        items: {
          create: itemsToCreate.map((item) => ({
            materialCode: item.materialCode,
            materialName: item.materialName,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: item.receivedQuantity,
            receivingQuantity: item.receivingQuantity,
            serialBatch: item.serialBatch,
            location: item.location,
            kcs: item.kcs ?? false,
          })),
        },
      },
      include: {
        items: true,
      },
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
