/**
 * Backfill script for material lifecycle events
 * Run with: npx tsx scripts/backfill-material-lifecycle-events.ts
 *
 * This script creates MaterialEvent records from existing data:
 * - MaterialRequest items → REQUEST events
 * - Approved MaterialRequests → APPROVED events
 * - InboundReceiptItems → INBOUND events
 * - InboundReceiptItems with KCS → QC events
 * - OutboundReceiptItems → OUTBOUND events
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create adapter and client
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface BackfillStats {
  processed: number;
  created: number;
  skipped: number;
  errors: number;
}

async function backfillMaterialRequestEvents(): Promise<BackfillStats> {
  console.log("\n📋 Backfilling REQUEST events from MaterialRequestItems...");
  const stats: BackfillStats = { processed: 0, created: 0, skipped: 0, errors: 0 };

  const requestItems = await prisma.materialRequestItem.findMany({
    include: {
      material: true,
      request: {
        include: {
          requester: true,
        },
      },
    },
  });

  for (const item of requestItems) {
    stats.processed++;
    try {
      // Check if event already exists
      const existing = await prisma.materialEvent.findFirst({
        where: {
          materialId: item.materialId,
          eventType: "REQUEST",
          referenceType: "MaterialRequest",
          referenceId: item.request.id,
        },
      });

      if (existing) {
        stats.skipped++;
        continue;
      }

      // Validate actor exists
      if (!item.request.requester) {
        console.warn(`  Skip: Requester not found for request ${item.request.requestCode}`);
        stats.skipped++;
        continue;
      }

      await prisma.materialEvent.create({
        data: {
          materialId: item.materialId,
          eventType: "REQUEST",
          eventDate: item.request.requestDate,
          actorId: item.request.requesterId,
          actorName: item.request.requester.name,
          referenceType: "MaterialRequest",
          referenceId: item.request.id,
          referenceCode: item.request.requestCode,
          description: `Yêu cầu vật tư trong ${item.request.requestCode}`,
          metadata: { quantity: item.requestedQuantity },
        },
      });
      stats.created++;
    } catch (error) {
      console.error(`  Error processing request item ${item.id}:`, error);
      stats.errors++;
    }
  }

  return stats;
}

async function backfillApprovedRequestEvents(): Promise<BackfillStats> {
  console.log("\n✅ Backfilling APPROVED events from approved MaterialRequests...");
  const stats: BackfillStats = { processed: 0, created: 0, skipped: 0, errors: 0 };

  // Find requests with approver (means they were approved)
  const approvedRequests = await prisma.materialRequest.findMany({
    where: {
      approverId: { not: null },
    },
    include: {
      approver: true,
      items: true,
    },
  });

  for (const request of approvedRequests) {
    for (const item of request.items) {
      stats.processed++;
      try {
        const existing = await prisma.materialEvent.findFirst({
          where: {
            materialId: item.materialId,
            eventType: "APPROVED",
            referenceType: "MaterialRequest",
            referenceId: request.id,
          },
        });

        if (existing) {
          stats.skipped++;
          continue;
        }

        if (!request.approver || !request.approverId) {
          stats.skipped++;
          continue;
        }

        await prisma.materialEvent.create({
          data: {
            materialId: item.materialId,
            eventType: "APPROVED",
            eventDate: request.updatedAt, // Use updatedAt as approval date
            actorId: request.approverId,
            actorName: request.approver.name,
            referenceType: "MaterialRequest",
            referenceId: request.id,
            referenceCode: request.requestCode,
            description: `Yêu cầu ${request.requestCode} được duyệt`,
          },
        });
        stats.created++;
      } catch (error) {
        console.error(`  Error processing approved request ${request.requestCode}:`, error);
        stats.errors++;
      }
    }
  }

  return stats;
}

async function backfillInboundEvents(): Promise<BackfillStats> {
  console.log("\n📥 Backfilling INBOUND events from InboundReceiptItems...");
  const stats: BackfillStats = { processed: 0, created: 0, skipped: 0, errors: 0 };

  const inboundItems = await prisma.inboundReceiptItem.findMany({
    where: {
      receivedQuantity: { gt: 0 },
    },
    include: {
      material: true,
      receipt: {
        include: {
          createdBy: true,
        },
      },
    },
  });

  for (const item of inboundItems) {
    stats.processed++;
    try {
      const existing = await prisma.materialEvent.findFirst({
        where: {
          materialId: item.materialId,
          eventType: "INBOUND",
          referenceType: "InboundReceipt",
          referenceId: item.receipt.id,
        },
      });

      if (existing) {
        stats.skipped++;
        continue;
      }

      await prisma.materialEvent.create({
        data: {
          materialId: item.materialId,
          eventType: "INBOUND",
          eventDate: item.receipt.inboundDate,
          actorId: item.receipt.createdById,
          actorName: item.receipt.createdBy.name,
          referenceType: "InboundReceipt",
          referenceId: item.receipt.id,
          referenceCode: item.receipt.receiptCode,
          description: `Nhập kho ${item.receivedQuantity} đơn vị qua ${item.receipt.receiptCode}`,
          metadata: { quantity: item.receivedQuantity },
        },
      });
      stats.created++;
    } catch (error) {
      console.error(`  Error processing inbound item ${item.id}:`, error);
      stats.errors++;
    }
  }

  return stats;
}

async function backfillQCEvents(): Promise<BackfillStats> {
  console.log("\n🔍 Backfilling QC events from KCS-checked InboundReceiptItems...");
  const stats: BackfillStats = { processed: 0, created: 0, skipped: 0, errors: 0 };

  const kcsItems = await prisma.inboundReceiptItem.findMany({
    where: {
      kcs: true,
    },
    include: {
      material: true,
      receipt: {
        include: {
          createdBy: true,
        },
      },
      kcsInspector: true,
    },
  });

  for (const item of kcsItems) {
    stats.processed++;
    try {
      const existing = await prisma.materialEvent.findFirst({
        where: {
          materialId: item.materialId,
          eventType: "QC",
          referenceType: "InboundReceiptItem",
          referenceId: item.id,
        },
      });

      if (existing) {
        stats.skipped++;
        continue;
      }

      // Use KCS inspector if available, otherwise use receipt creator
      const actorId = item.kcsInspectorId ?? item.receipt.createdById;
      const actorName = item.kcsInspector?.name ?? item.receipt.createdBy.name;
      const eventDate = item.kcsDate ?? item.updatedAt;

      await prisma.materialEvent.create({
        data: {
          materialId: item.materialId,
          eventType: "QC",
          eventDate: eventDate,
          actorId: actorId,
          actorName: actorName,
          referenceType: "InboundReceiptItem",
          referenceId: item.id,
          referenceCode: item.receipt.receiptCode,
          description: `Kiểm tra chất lượng (KCS) hoàn thành`,
          metadata: { result: item.kcsResult ?? "PASSED" },
        },
      });
      stats.created++;
    } catch (error) {
      console.error(`  Error processing KCS item ${item.id}:`, error);
      stats.errors++;
    }
  }

  return stats;
}

async function backfillOutboundEvents(): Promise<BackfillStats> {
  console.log("\n📤 Backfilling OUTBOUND events from OutboundReceiptItems...");
  const stats: BackfillStats = { processed: 0, created: 0, skipped: 0, errors: 0 };

  const outboundItems = await prisma.outboundReceiptItem.findMany({
    where: {
      issuedQuantity: { gt: 0 },
    },
    include: {
      material: true,
      receipt: {
        include: {
          createdBy: true,
        },
      },
    },
  });

  for (const item of outboundItems) {
    stats.processed++;
    try {
      const existing = await prisma.materialEvent.findFirst({
        where: {
          materialId: item.materialId,
          eventType: "OUTBOUND",
          referenceType: "OutboundReceipt",
          referenceId: item.receipt.id,
        },
      });

      if (existing) {
        stats.skipped++;
        continue;
      }

      await prisma.materialEvent.create({
        data: {
          materialId: item.materialId,
          eventType: "OUTBOUND",
          eventDate: item.receipt.issuedAt ?? item.receipt.outboundDate,
          actorId: item.receipt.createdById,
          actorName: item.receipt.createdBy.name,
          referenceType: "OutboundReceipt",
          referenceId: item.receipt.id,
          referenceCode: item.receipt.receiptCode,
          description: `Xuất kho ${item.issuedQuantity} đơn vị qua ${item.receipt.receiptCode}`,
          metadata: { quantity: item.issuedQuantity },
        },
      });
      stats.created++;
    } catch (error) {
      console.error(`  Error processing outbound item ${item.id}:`, error);
      stats.errors++;
    }
  }

  return stats;
}

async function main() {
  console.log("🚀 Starting Material Lifecycle Events Backfill...\n");
  console.log("=".repeat(60));

  const allStats: Record<string, BackfillStats> = {};

  try {
    allStats.request = await backfillMaterialRequestEvents();
    allStats.approved = await backfillApprovedRequestEvents();
    allStats.inbound = await backfillInboundEvents();
    allStats.qc = await backfillQCEvents();
    allStats.outbound = await backfillOutboundEvents();

    console.log("\n" + "=".repeat(60));
    console.log("📊 BACKFILL SUMMARY\n");

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [type, stats] of Object.entries(allStats)) {
      console.log(`  ${type.toUpperCase()}:`);
      console.log(`    Processed: ${stats.processed}`);
      console.log(`    Created: ${stats.created}`);
      console.log(`    Skipped: ${stats.skipped}`);
      console.log(`    Errors: ${stats.errors}`);
      console.log();

      totalProcessed += stats.processed;
      totalCreated += stats.created;
      totalSkipped += stats.skipped;
      totalErrors += stats.errors;
    }

    console.log("=".repeat(60));
    console.log("  TOTAL:");
    console.log(`    Processed: ${totalProcessed}`);
    console.log(`    Created: ${totalCreated}`);
    console.log(`    Skipped: ${totalSkipped}`);
    console.log(`    Errors: ${totalErrors}`);
    console.log("\n✅ Backfill complete!");
  } catch (error) {
    console.error("\n❌ Fatal error during backfill:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
