# Feature: Lịch sử Hàng hóa (Item History)

> **Date**: 2026-02-01  
> **Status**: APPROVED (Final)
> **Dependency**: [260201-2150-implement-lifecycle-tracking](../260201-2150-implement-lifecycle-tracking/plan.md)

---

## 1. Schema Changes

### 1.1 NEW: Enums

```prisma
enum TransactionStatus {
  PENDING
  COMPLETED
  CANCELLED
}

enum ReferenceType {
  OutboundReceipt
  InboundReceipt
}
```

### 1.2 NEW: OutboundType & InboundType

```prisma
model OutboundType {
  id        String   @id @default(uuid())
  code      String   @unique  // SALE, WARRANTY_OUT, REPAIR_OUT, TRANSFER, RETURN
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  outboundReceipts     OutboundReceipt[]
  materialTransactions MaterialTransaction[] @relation("TransactionOutboundType")
  
  @@map("outbound_types")
}

model InboundType {
  id        String   @id @default(uuid())
  code      String   @unique  // PO, WARRANTY_IN, REPAIR_IN, TRANSFER, RETURN
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inboundReceipts      InboundReceipt[]
  materialTransactions MaterialTransaction[] @relation("TransactionInboundType")
  
  @@map("inbound_types")
}
```

### 1.3 MODIFY: Receipts

```prisma
model OutboundReceipt {
  // ... existing ...
  typeId       String?
  type         OutboundType? @relation(fields: [typeId], references: [id])
  customerName String?
}

model InboundReceipt {
  // ... existing ...
  typeId String?
  type   InboundType? @relation(fields: [typeId], references: [id])
}
```

### 1.4 MODIFY: Material

```prisma
model Material {
  supplierWarrantyStart   DateTime?
  supplierWarrantyEnd     DateTime?
  serviceWarrantyStart    DateTime?
  serviceWarrantyEnd      DateTime?
  
  // Deprecated backup
  supplierWarranty String?
  serviceWarranty  String?
  
  transactions MaterialTransaction[]
}
```

### 1.5 NEW: MaterialTransaction

```prisma
model MaterialTransaction {
  id          String   @id @default(uuid())
  
  materialId  String
  material    Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  
  title       String
  status      TransactionStatus @default(PENDING)
  
  outboundTypeId String?
  inboundTypeId  String?
  outboundType   OutboundType? @relation("TransactionOutboundType", fields: [outboundTypeId], references: [id])
  inboundType    InboundType?  @relation("TransactionInboundType", fields: [inboundTypeId], references: [id])
  
  referenceType  ReferenceType
  referenceId    String
  
  counterpartyName String?
  
  startedAt   DateTime
  completedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  events      MaterialEvent[]
  
  @@index([materialId, startedAt])
  @@index([referenceType, referenceId])  // Compound index
  @@map("material_transactions")
}
```

---

## 2. Validation (Zod)

```typescript
const materialTransactionSchema = z.object({
  outboundTypeId: z.string().uuid().optional(),
  inboundTypeId: z.string().uuid().optional(),
  referenceType: z.nativeEnum(ReferenceType),
}).refine(
  data => (data.outboundTypeId != null) !== (data.inboundTypeId != null),
  { message: "Must set exactly one: outboundTypeId OR inboundTypeId" }
);
```

---

## 3. Migration Script

```typescript
// scripts/migrate-warranty.ts
const BATCH_SIZE = 100;

async function migrateWarranty(dryRun: boolean) {
  const total = await prisma.material.count({
    where: { OR: [
      { supplierWarranty: { not: null } },
      { serviceWarranty: { not: null } }
    ]}
  });
  
  let processed = 0;
  
  while (processed < total) {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.material.findMany({
        where: { OR: [
          { supplierWarranty: { not: null } },
          { serviceWarranty: { not: null } }
        ]},
        skip: processed,
        take: BATCH_SIZE
      });
      
      for (const m of batch) {
        const supplierParsed = parseWarrantyString(m.supplierWarranty);
        const serviceParsed = parseWarrantyString(m.serviceWarranty);
        
        if (!dryRun) {
          await tx.material.update({
            where: { id: m.id },
            data: {
              supplierWarrantyStart: supplierParsed?.start,
              supplierWarrantyEnd: supplierParsed?.end,
              serviceWarrantyStart: serviceParsed?.start,
              serviceWarrantyEnd: serviceParsed?.end,
            }
          });
        }
      }
      processed += batch.length;
    });
    console.log(`Processed ${processed}/${total}`);
  }
}

// Feature flag: .env
// WARRANTY_USE_DATETIME=true
```

---

## 4. API Design

### 4.1 Endpoint

```
GET /api/materials/[id]/history?limit=20&offset=0
```

### 4.2 Response Schema

```typescript
interface ItemHistoryResponse {
  material: {
    id: string;
    code: string;
    partNo: string;
    serialNumber: string;
    manufacturer: string;
  };
  location: {
    code: string;
    name: string;
  };
  statistics: {
    stockAge: string;
    warrantyCount: number;
    lifespan: string;
  };
  warranty: {
    supplier: { start: Date; end: Date } | null;
    service: { start: Date; end: Date } | null;
  };
  transactions: {
    id: string;
    title: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    type: { code: string; name: string };
    completedAt: Date | null;
    events: { stepOrder: number; stepTitle: string; actorName: string; eventDate: Date }[];
  }[];
  pagination: { total: number; limit: number; offset: number };
}
```

### 4.3 Error Handling

| Status | Condition |
|--------|-----------|
| 200 | Success (empty transactions = no history) |
| 403 | No permission |
| 404 | Material not found |
| 500 | Transaction creation fails mid-operation → rollback |

---

## 5. Access Control

```typescript
// Permission: ITEM_HISTORY:VIEW (inherits from MATERIAL:VIEW)
// Audit: Log access to sensitive fields (counterpartyName)

if (!hasPermission(user, 'ITEM_HISTORY', 'VIEW') && 
    !hasPermission(user, 'MATERIAL', 'VIEW')) {
  return res.status(403).json({ error: 'Access denied' });
}

// Audit log
await logAccess(user.id, 'ITEM_HISTORY', materialId);
```

---

## 6. Implementation Phases

### Phase 0a: Schema (0.5d)
```bash
npx prisma migrate dev --name add_transaction_types
```
- [ ] Add enums: TransactionStatus, ReferenceType
- [ ] Add OutboundType, InboundType models
- [ ] Add typeId FK to receipts
- [ ] Add warranty DateTime fields
- [ ] Add MaterialTransaction with indexes

### Phase 0b: Migration & Seed (0.5d)
- [ ] Seed OutboundType, InboundType
- [ ] Run warranty migration script with batching
- [ ] Add WARRANTY_USE_DATETIME to .env.example

### Phase 1: Lifecycle Plan (4d)
> Complete [lifecycle-tracking](../260201-2150-implement-lifecycle-tracking/plan.md) first

### Phase 2: Transaction API (2d)
- [ ] Create `/api/materials/[id]/history`
- [ ] Create MaterialTransaction on Inbound/Outbound
- [ ] Add access control & audit logging

### Phase 3a: Core Components (1d)
- [ ] ItemHistoryPage
- [ ] MaterialInfoCard
- [ ] StatisticsCard

### Phase 3b: Timeline Components (1d)
- [ ] GroupedTimeline
- [ ] TransactionGroup
- [ ] EventStep

---

## 7. Testing Strategy

| Phase | Test Cases |
|-------|------------|
| 0b | Warranty parsing: valid, invalid, edge cases |
| 2 | API: pagination, empty results, 404, 403 |
| 3 | UI: loading, empty state, grouped display |

---

## 8. Effort: ~9 days

| Phase | Estimate |
|-------|----------|
| 0a Schema | 0.5d |
| 0b Migration | 0.5d |
| 1 Lifecycle | 4d |
| 2 API | 2d |
| 3a/3b Frontend | 2d |

---

## 9. Ready for Implementation ✅
