# Feature: Truy vết Vòng đời Vật tư (Material Lifecycle Tracking)

> **Date**: 2026-02-01  
> **Status**: APPROVED (Review Round 5 Complete)

---

## 1. Overview

Màn hình tra cứu lịch sử vòng đời vật tư từ **Yêu cầu → Vận hành**.

---

## 2. Schema Changes

### 2.1 Material Enhancement

```prisma
model Material {
  // ... existing fields ...
  
  @@index([serialNumber])  // For search performance
  
  lifecycleEvents MaterialEvent[]
  installations   Installation[]
}
```

### 2.2 MaterialEventType Enum

```prisma
enum MaterialEventType {
  REQUEST
  APPROVED
  PO_ISSUED   // Future phase
  INBOUND
  QC
  OUTBOUND
  INSTALLED
}
```

### 2.3 MaterialEvent (with FK to User)

```prisma
model MaterialEvent {
  id          String   @id @default(uuid())
  
  materialId  String
  eventType   MaterialEventType
  eventDate   DateTime
  
  // Actor with FK relation (User chose Option B)
  actorId     String
  actorName   String   // Denormalized for display
  actor       User     @relation("EventActor", fields: [actorId], references: [id])
  
  referenceType  String
  referenceId    String
  referenceCode  String
  
  description String
  metadata    Json?
  
  createdAt   DateTime @default(now())
  
  material    Material @relation(fields: [materialId], references: [id])
  
  @@index([materialId, eventDate])
  @@index([referenceType, referenceId])
  @@map("material_events")
}
```

### 2.4 Installation

```prisma
model Installation {
  id              String   @id @default(uuid())
  
  materialId      String
  installedById   String
  
  material        Material @relation(fields: [materialId], references: [id])
  installedBy     User     @relation("InstallationPerformer", fields: [installedById], references: [id])
  
  locationName    String
  slotInfo        String?
  installedAt     DateTime
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([materialId])
  @@index([installedById])
  @@map("installations")
}
```

### 2.5 InboundReceiptItem Enhancement

```prisma
model InboundReceiptItem {
  // ... existing fields ...
  
  kcsDate        DateTime?
  kcsInspectorId String?
  kcsResult      String?
  
  kcsInspector   User? @relation("KCSInspector", fields: [kcsInspectorId], references: [id])
  
  @@index([kcsInspectorId])
}
```

### 2.6 User Relations

```prisma
model User {
  // ... existing fields ...
  performedInstallations Installation[]       @relation("InstallationPerformer")
  kcsInspections         InboundReceiptItem[] @relation("KCSInspector")
  materialEvents         MaterialEvent[]      @relation("EventActor")  // NEW
}
```

---

## 3. API Design

### 3.1 Main API

```
GET /api/materials/[id]/lifecycle?limit=50&offset=0&fromDate=&toDate=
```

### 3.2 Zod Validation

```typescript
// src/lib/validations/lifecycle.ts
export const lifecycleQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});
```

### 3.3 TypeScript Types

```typescript
// src/lib/types/lifecycle.ts
export interface MaterialLifecycleResponse {
  material: MaterialInfo;
  currentLocation: LocationInfo;
  timeline: MaterialEventDto[];
  pagination: { total: number; limit: number; offset: number };
}
```

---

## 4. Phase 2: Event Logging Endpoints

| Endpoint | Event Type | Status |
|----------|------------|--------|
| `POST /api/material-requests` | REQUEST | ✅ |
| `PATCH /api/material-requests/[id]` | APPROVED | ✅ |
| `PATCH /api/bidding-packages/[id]` | PO_ISSUED | ⏳ Future |
| `PATCH /api/inbound/[id]/complete` | INBOUND | ✅ |
| `PATCH /api/inbound/[id]/items/[itemId]` | QC | ✅ |
| `PATCH /api/outbound/[id]/issue` | OUTBOUND | ✅ |
| `POST /api/installations` | INSTALLED | ✅ |

---

## 5. Backfill Script

```typescript
// scripts/backfill-material-events.ts
for (const material of batch) {
  try {
    // Validate actorId exists before creating event
    const actor = await tx.user.findUnique({ where: { id: actorId } });
    if (!actor) {
      console.warn(`Skip: Actor ${actorId} not found`);
      skipped++;
      continue;
    }
    
    await tx.materialEvent.create({ data: { ... } });
    processed++;
  } catch (error) {
    // Log error but continue with next material
    console.error(`Error processing ${material.code}:`, error);
    errors++;
  }
}

// Note: InventoryLog is legacy, no migration needed (lacks materialId FK)
```

---

## 6. Frontend Components (Phase 4)

| Component | Description |
|-----------|-------------|
| `Timeline.tsx` | Main timeline display |
| `EventCard.tsx` | Individual event card |
| `SearchBar.tsx` | Serial number search |
| `MaterialInfoCard.tsx` | Left info panel |
| `FilterBar.tsx` | Date range filters |

---

## 7. Implementation Phases

| Phase | Task | Estimate |
|-------|------|----------|
| 0 | Schema Migration | 0.5d |
| 1 | Backfill Events | 1d |
| 2 | Event Logging | 1d |
| 3 | Lifecycle API | 0.5d |
| 4 | Frontend | 1d |
| **Total** | | **~4d** |

---

## 8. Clarified Requirements

| # | Decision |
|---|----------|
| 1 | ✅ Free text installation location |
| 2 | ✅ Basic KCS only |
| 3 | ✅ Backfill enabled |
| 4 | ✅ 1 serial per material |
| 5 | ✅ Event Sourcing |
| 6 | ✅ Enum eventType |
| 7 | ✅ MaterialId-based API |
| 8 | ✅ Plural `/api/materials` |
| 9 | ✅ PO_ISSUED future phase |
| 10 | ✅ FK relation for actorId |

---

## 9. Ready for Implementation ✅

All review issues addressed. Plan APPROVED.
