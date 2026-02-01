---
title: "Refactor Warehouse FK Relationships"
description: "Chuyển WarehouseLocation và WarehouseItem sang sử dụng Foreign Key thay vì String"
status: pending
priority: P0
effort: 1d
branch: main
---

# Refactor Warehouse FK Relationships

**Date**: 2026-02-01
**Type**: Database Refactoring
**Status**: Planning

## Executive Summary

Refactor models `WarehouseLocation` và `WarehouseItem` để sử dụng FK relationships thay vì lưu trực tiếp string. Áp dụng pattern giống model `Material` (đã có sẵn `categoryId`, `unitId`, `statusId`).

## Phạm vi thay đổi

### WarehouseLocation
| Field hiện tại | → FK mới | → Relation table |
|----------------|----------|------------------|
| `area: String` | `areaId: String` | `WarehouseArea` |
| `type: String` | `typeId: String` | `WarehouseType` |
| `status: String` | `statusId: String` | `WarehouseStatus` |

### WarehouseItem
| Field hiện tại | → FK mới | → Relation table |
|----------------|----------|------------------|
| `unit: String` | `unitId: String` | `Unit` |

---

## Implementation Phases

### Phase 1: Schema Migration (~30 mins)

#### 1.1 Cập nhật Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
// WarehouseLocation - BEFORE
model WarehouseLocation {
  area   String
  type   String
  status String @default("Active")
}

// WarehouseLocation - AFTER
model WarehouseLocation {
  areaId   String
  typeId   String
  statusId String

  area   WarehouseArea   @relation(fields: [areaId], references: [id])
  type   WarehouseType   @relation(fields: [typeId], references: [id])
  status WarehouseStatus @relation(fields: [statusId], references: [id])
}

// WarehouseItem - BEFORE
model WarehouseItem {
  unit String
}

// WarehouseItem - AFTER  
model WarehouseItem {
  unitId String
  unit   Unit @relation(fields: [unitId], references: [id])
}
```

#### 1.2 Thêm relation ngược vào Master Data

```prisma
model WarehouseArea {
  locations WarehouseLocation[]
}

model WarehouseType {
  locations WarehouseLocation[]
}

model WarehouseStatus {
  locations WarehouseLocation[]
}

model Unit {
  warehouseItems WarehouseItem[]
}
```

---

### Phase 2: Seed Data Update (~20 mins)

**File**: `prisma/seed.ts`

Cập nhật seed để lookup ID từ master data tables:

```typescript
// Get master data IDs first
const areaA = await prisma.warehouseArea.findUnique({ where: { code: 'AREA-A' }});
const typeRack = await prisma.warehouseType.findUnique({ where: { code: 'RACK' }});
const statusActive = await prisma.warehouseStatus.findUnique({ where: { code: 'ACTIVE' }});

// Seed WarehouseLocation with FK IDs
await prisma.warehouseLocation.create({
  data: {
    code: 'A1-01-01',
    name: 'Kệ 01 - Tầng 1 - Dãy A',
    areaId: areaA.id,
    typeId: typeRack.id, 
    statusId: statusActive.id
  }
});
```

---

### Phase 3: API Updates (~30 mins)

| File | Changes |
|------|---------|
| `src/app/api/warehouse-locations/route.ts` | Include relations in query, update create logic |
| `src/app/api/warehouse-locations/[id]/route.ts` | Include relations, update PUT logic |
| `src/lib/validations/warehouse-location.ts` | Validate FK IDs instead of strings |

**Key changes**:
```typescript
// API Response - include nested relations
const locations = await prisma.warehouseLocation.findMany({
  include: { 
    area: true, 
    type: true, 
    status: true 
  }
});
```

---

### Phase 4: Frontend Updates (~30 mins)

| File | Changes |
|------|---------|
| `src/lib/types.ts` | Update interfaces |
| `src/app/warehouses/_components/warehouse-form.tsx` | Submit FK IDs |
| `src/app/warehouses/_components/warehouses-client.tsx` | Display nested data |

**Type changes**:
```typescript
interface WarehouseLocation {
  areaId: string;
  typeId: string;
  statusId: string;
  area: { id: string; name: string };
  type: { id: string; name: string };
  status: { id: string; name: string; color?: string };
}
```

---

## Migration Commands

```bash
# 1. Reset database
npx prisma db push --force-reset

# 2. Regenerate client
npx prisma generate

# 3. Reseed data
npx prisma db seed

# 4. Verify in Prisma Studio
npx prisma studio
```

---

## TODO Checklist

- [ ] Phase 1.1: Update `schema.prisma` (WarehouseLocation)
- [ ] Phase 1.2: Update `schema.prisma` (WarehouseItem)
- [ ] Phase 1.3: Add relations to master data models
- [ ] Phase 2: Update `seed.ts`
- [ ] Phase 3.1: Update API routes
- [ ] Phase 3.2: Update validation schemas
- [ ] Phase 4.1: Update TypeScript types
- [ ] Phase 4.2: Update frontend components
- [ ] Run migration & test
