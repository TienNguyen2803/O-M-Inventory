# Feature: Lịch sử Hàng hóa (Item History)

> **Status**: APPROVED  
> **Dependency**: [lifecycle-tracking](../260201-2150-implement-lifecycle-tracking/plan.md)

---

## 1. Schema

### Enums
```prisma
enum TransactionStatus { PENDING COMPLETED CANCELLED }
enum ReferenceType { OutboundReceipt InboundReceipt }
```

### Master Data
```prisma
model OutboundType {
  id        String   @id @default(uuid())
  code      String   @unique  // SALE, WARRANTY_OUT, REPAIR_OUT, TRANSFER, RETURN
  name      String
  outboundReceipts     OutboundReceipt[]
  materialTransactions MaterialTransaction[] @relation("TransactionOutboundType")
  @@map("outbound_types")
}

model InboundType {
  id        String   @id @default(uuid())
  code      String   @unique  // PO, WARRANTY_IN, REPAIR_IN, TRANSFER, RETURN
  name      String
  inboundReceipts      InboundReceipt[]
  materialTransactions MaterialTransaction[] @relation("TransactionInboundType")
  @@map("inbound_types")
}
```

### MaterialTransaction
```prisma
model MaterialTransaction {
  id             String   @id @default(uuid())
  materialId     String
  material       Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  
  title          String
  status         TransactionStatus @default(PENDING)
  
  // Dual optional typeIds (XOR enforced via Zod)
  outboundTypeId String?
  inboundTypeId  String?
  outboundType   OutboundType? @relation("TransactionOutboundType", fields: [outboundTypeId], references: [id])
  inboundType    InboundType?  @relation("TransactionInboundType", fields: [inboundTypeId], references: [id])
  
  referenceType     ReferenceType
  referenceId       String
  counterpartyName  String?
  
  startedAt   DateTime
  completedAt DateTime?
  createdAt   DateTime @default(now())
  
  events MaterialEvent[]
  
  @@index([materialId, startedAt])
  @@index([referenceType, referenceId])
  @@index([completedAt])
  @@map("material_transactions")
}
```

### Material Warranty Fields
```prisma
model Material {
  supplierWarrantyStart DateTime?
  supplierWarrantyEnd   DateTime?
  serviceWarrantyStart  DateTime?
  serviceWarrantyEnd    DateTime?
  supplierWarranty      String?  // @deprecated backup
  serviceWarranty       String?  // @deprecated backup
}
```

---

## 2. Migration Script (Cursor-based)

```typescript
// scripts/migrate-warranty.ts
const BATCH_SIZE = 100;

interface MigrationState {
  lastId: string | null;
  processed: number;
  failed: string[];
}

async function migrateWarranty(dryRun: boolean, resume?: MigrationState) {
  let state: MigrationState = resume || { lastId: null, processed: 0, failed: [] };
  
  while (true) {
    const batch = await prisma.material.findMany({
      where: {
        OR: [{ supplierWarranty: { not: null } }, { serviceWarranty: { not: null } }],
        ...(state.lastId ? { id: { gt: state.lastId } } : {})
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE
    });
    
    if (batch.length === 0) break;
    
    await prisma.$transaction(async (tx) => {
      for (const m of batch) {
        try {
          const supplier = parseWarrantyString(m.supplierWarranty);
          const service = parseWarrantyString(m.serviceWarranty);
          
          if (!dryRun) {
            await tx.material.update({
              where: { id: m.id },
              data: {
                supplierWarrantyStart: supplier?.start,
                supplierWarrantyEnd: supplier?.end,
                serviceWarrantyStart: service?.start,
                serviceWarrantyEnd: service?.end,
              }
            });
          }
        } catch (e) {
          state.failed.push(m.id);
          console.error(`Failed ${m.code}: ${e.message}`);
        }
      }
    });
    
    state.lastId = batch[batch.length - 1].id;
    state.processed += batch.length;
    
    // Checkpoint
    await fs.writeFile('migration-state.json', JSON.stringify(state));
    console.log(`Processed ${state.processed}, last: ${state.lastId}`);
  }
  
  return state;
}

// Warranty string parser
function parseWarrantyString(str: string | null): { start: Date; end: Date } | null {
  if (!str) return null;
  
  // Format: "01/01/2024 - 01/01/2026" or "2024-01-01 to 2026-01-01"
  const patterns = [
    /(\d{2}\/\d{2}\/\d{4})\s*[-–]\s*(\d{2}\/\d{2}\/\d{4})/,  // DD/MM/YYYY
    /(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})/   // YYYY-MM-DD
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      const [, startStr, endStr] = match;
      const start = parseDate(startStr);
      const end = parseDate(endStr);
      if (start && end) return { start, end };
    }
  }
  
  console.warn(`Unparseable: "${str}"`);
  return null;
}

function parseDate(str: string): Date | null {
  if (str.includes('/')) {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(str);
}
```

---

## 3. API Response

```typescript
interface ItemHistoryResponse {
  material: MaterialInfo;
  statistics: {
    stockAge: { value: number; unit: 'days' | 'months' | 'years' };
    warrantyCount: number;
    lifespan: { value: number; unit: 'days' | 'months' | 'years' };
  };
  transactions: MaterialTransactionDto[];
  pagination: { total: number; limit: number; offset: number };
}
```

---

## 4. Access Control

```typescript
// ITEM_HISTORY:VIEW inherits from MATERIAL:VIEW
// If user has MATERIAL:VIEW, they automatically have ITEM_HISTORY:VIEW
const canView = hasPermission(user, 'ITEM_HISTORY', 'VIEW') || 
                hasPermission(user, 'MATERIAL', 'VIEW');
```

---

## 5. Phases

| Phase | Tasks | Estimate |
|-------|-------|----------|
| **0a** | Schema: enums, types, transaction, indexes | 0.5d |
| **0b** | Migration: cursor-based, parseWarrantyString | 0.5d |
| **0c** | Admin UI for OutboundType/InboundType | 0.5d |
| **1** | Lifecycle plan (dependency) | 4d |
| **2** | History API with pagination | 2d |
| **3a** | Core: Page, InfoCard, Stats | 1d |
| **3b** | Timeline: Groups, Events | 1d |
| **Total** | | **~9.5d** |

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Migration fails mid-way | Checkpoint/resume logic |
| Orphaned transactions | Prisma middleware cascade |
| Slow history queries | completedAt index, caching |
| Unparseable warranty | Fallback to String backup |

---

## Ready for Implementation ✅
