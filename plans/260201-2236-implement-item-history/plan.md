# Feature: Lịch sử Hàng hóa (Item History)

> **Status**: IMPLEMENTED
> **Dependency**: [lifecycle-tracking](../260201-2150-implement-lifecycle-tracking/plan.md)

---

## 1. Schema

### Enums
```prisma
enum TransactionStatus { PENDING COMPLETED CANCELLED }
enum ReferenceType { OUTBOUND_RECEIPT INBOUND_RECEIPT }
```

### MODIFY: Relations (with onDelete)
```prisma
model OutboundPurpose {
  materialTransactions MaterialTransaction[] @relation("TransactionOutboundPurpose")
}

model InboundType {
  materialTransactions MaterialTransaction[] @relation("TransactionInboundType")
}
```

### NEW: MaterialTransaction
```prisma
model MaterialTransaction {
  id             String   @id @default(uuid())
  materialId     String
  material       Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  
  title          String
  status         TransactionStatus @default(PENDING)
  quantity       Int      @default(1)  // For inventory tracking
  
  outboundPurposeId String?
  inboundTypeId     String?
  outboundPurpose   OutboundPurpose? @relation("TransactionOutboundPurpose", fields: [outboundPurposeId], references: [id], onDelete: SetNull)
  inboundType       InboundType?     @relation("TransactionInboundType", fields: [inboundTypeId], references: [id], onDelete: SetNull)
  
  referenceType     ReferenceType
  referenceId       String
  counterpartyName  String?
  
  startedAt   DateTime
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  events MaterialEvent[]
  
  @@unique([referenceType, referenceId])
  @@index([materialId, startedAt])
  @@index([completedAt])
  @@map("material_transactions")
}
```

### MODIFY: MaterialEvent
```prisma
model MaterialEvent {
  transactionId String?
  transaction   MaterialTransaction? @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  stepOrder     Int?      // Required when transactionId is set (enforced via Zod)
  stepTitle     String?
}
```

---

## 2. Code Quality Fixes

```typescript
const MS_PER_DAY = 86_400_000;

function calculateAge(createdAt: Date): { value: number; unit: string } {
  const days = Math.floor((Date.now() - createdAt.getTime()) / MS_PER_DAY);
  if (days < 0) {
    console.warn(`Future createdAt detected: ${createdAt.toISOString()}`);
    return { value: 0, unit: 'days' };
  }
  if (days < 30) return { value: days, unit: 'days' };
  if (days < 365) return { value: Math.floor(days / 30), unit: 'months' };
  return { value: Math.floor(days / 365), unit: 'years' };
}

function parseDate(str: string): Date | null {
  let date: Date;
  if (str.includes('/')) {
    const [d, m, y] = str.split('/').map(Number);
    if (d < 1 || d > 31 || m < 1 || m > 12) {
      console.error(`Invalid date: ${str}`);
      return null;
    }
    date = new Date(Date.UTC(y, m - 1, d));
  } else {
    date = new Date(str + 'T00:00:00Z');
  }
  
  // Validate parsed date
  if (!date || date.getMonth() !== m - 1) {
    console.error(`Failed to parse date: ${str}`);
    return null;
  }
  return isNaN(date.getTime()) ? null : date;
}
```

---

## 3. API Endpoints

```
GET /api/materials/:id/history
  Query: ?limit=20&offset=0
  Response: { material, statistics, transactions[], pagination }
  Errors: 404 (not found), 403 (unauthorized)

GET /api/materials/:id/transactions/:txId
  Response: { transaction with events[] }
  Errors: 404, 403
```

### Security
- Validate `referenceId` exists in actual receipts
- Authorization: only owners/admins can view transaction history
- Sanitize `counterpartyName` before storage (XSS prevention)

---

## 4. Frontend Components

```
src/app/item-history/
├── page.tsx              # ItemHistoryPage
├── _components/
│   ├── material-info-card.tsx
│   ├── statistics-card.tsx
│   ├── grouped-timeline.tsx
│   ├── transaction-group.tsx
│   └── event-step.tsx
└── loading.tsx           # Skeleton
```

**UI States:**
- Loading: skeleton shimmer
- Empty: "Chưa có lịch sử giao dịch"
- Error: "Không thể tải dữ liệu. Vui lòng thử lại."
- Pagination: infinite scroll or "Load more"

---

## 5. Migration (with progress tracking)

```typescript
// migrations/001_create_failed_log.sql
CREATE TABLE IF NOT EXISTS migration_failed_log (
  id VARCHAR PRIMARY KEY,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE materials ADD COLUMN migration_status VARCHAR DEFAULT 'pending';
```

```typescript
// scripts/migrate-warranty.ts
const BATCH_SIZE = 100;

async function migrateWarranty() {
  while (true) {
    const batch = await prisma.material.findMany({
      where: { migrationStatus: 'pending' },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE
    });
    
    if (!batch.length) break;
    
    for (const m of batch) {
      try {
        const supplier = parseWarrantyString(m.supplierWarranty);
        const service = parseWarrantyString(m.serviceWarranty);
        
        await prisma.material.update({
          where: { id: m.id },
          data: {
            supplierWarrantyStart: supplier?.start,
            supplierWarrantyEnd: supplier?.end,
            serviceWarrantyStart: service?.start,
            serviceWarrantyEnd: service?.end,
            migrationStatus: 'completed'
          }
        });
      } catch (e) {
        await prisma.material.update({
          where: { id: m.id },
          data: { migrationStatus: 'failed' }
        });
        await logMigrationError(m.id, e.message);
      }
    }
  }
}
```

---

## 6. Test Plan

| Phase | Tests |
|-------|-------|
| 0b | Warranty parsing: valid, invalid (32/13), edge cases |
| 2 | API: 404, 403, pagination, empty results |
| 3 | UI: loading, empty, error states, pagination |

---

## 7. Phases

| Phase | Tasks | Estimate | Status |
|-------|-------|----------|--------|
| 0a | Schema + failed_log migration | 0.5d | ✅ Done |
| 0b | Warranty migration with progress | 0.5d | ⏳ Skipped (no legacy data) |
| 1 | Lifecycle plan (dependency) | 4d | ✅ Done |
| 1b | Admin UI for types (parallel) | 0.5d | ⏳ Deferred |
| 2 | History API + security | 2d | ✅ Done |
| 3 | Frontend + error states | 2d | ✅ Done |
| **Total** | | **~9.5d** | |

---

## Ready for Implementation ✅
