import { prisma } from "@/lib/db";
import { InboundClient } from "./_components/inbound-client";
import { InboundReceipt } from "@/lib/types";

export default async function InboundPage() {
  // Fetch from database directly for Server Component
  // We use take: 100 as a default limit for initial load
  const receiptsData = await prisma.inboundReceipt.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      documents: true,
    },
  });

  // Transform Prisma data to match our application type (dates to strings)
  const receipts: InboundReceipt[] = receiptsData.map((r) => ({
    id: r.id,
    receiptCode: r.receiptCode,
    inboundType: r.inboundType as any, // Cast to union type
    reference: r.reference,
    inboundDate: r.inboundDate.toISOString(),
    partner: r.partner,
    status: r.status as any, // Cast to union type
    step: r.step,
    items: r.items.map((i) => ({
      id: i.id,
      materialCode: i.materialCode,
      materialName: i.materialName,
      orderedQuantity: i.orderedQuantity,
      receivedQuantity: i.receivedQuantity,
      receivingQuantity: i.receivingQuantity,
      serialBatch: i.serialBatch || "",
      location: i.location || "",
      kcs: i.kcs,
    })),
    documents: r.documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
    })),
  }));

  return <InboundClient initialReceipts={receipts} />;
}
