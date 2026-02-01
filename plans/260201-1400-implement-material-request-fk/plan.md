---
title: "Implement Material Request Feature with FK Relationships"
description: "Refactor MaterialRequest model to use FK for master data, integrate API and frontend"
status: completed
priority: P0
effort: 2d
branch: main
completed_at: 2026-02-01
---

# Material Request Feature Implementation Plan

## 1. Mục tiêu

Refactor `MaterialRequest` và `MaterialRequestItem` models để sử dụng Foreign Key relationships với các master data tables, thay vì lưu String. Đảm bảo consistency với pattern đã áp dụng cho `Supplier` và `WarehouseLocation`.

## 2. Phạm vi thay đổi

### 2.1 Schema Migration

**MaterialRequest:**
| Field | Current | Target |
|-------|---------|--------|
| `requesterName` | String | FK → `User.id` (`requesterId`) |
| `requesterDept` | String | FK → `Department.id` (`departmentId`) |
| `priority` | String | FK → `RequestPriority.id` (`priorityId`) |
| `status` | String | FK → `RequestStatus.id` (`statusId`) |
| `approver` | String | FK → `User.id` (`approverId`, nullable) |

**MaterialRequestItem:**
| Field | Current | Target |
|-------|---------|--------|
| `materialId` | String | FK → `Material.id` |
| `materialCode` | String | **REMOVE** (get from `Material.code`) |
| `materialName` | String | **REMOVE** (get from `Material.name`) |
| `partNumber` | String | **REMOVE** (get from `Material.partNumber`) |
| `unit` | String | FK → `MaterialUnit.id` (`unitId`) |

---

## 3. Phase 1: Schema Migration

### 3.1 Tạo Master Data Tables mới

```prisma
// === YÊU CẦU VẬT TƯ (2 bảng) ===

model RequestPriority {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  materialRequests MaterialRequest[]

  @@map("request_priorities")
}

model RequestStatus {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  materialRequests MaterialRequest[]

  @@map("request_statuses")
}
```

### 3.2 Update MaterialRequest Model

```prisma
model MaterialRequest {
  id           String   @id @default(uuid())
  requestCode  String   @unique
  
  // FK Relations
  requesterId  String
  departmentId String
  priorityId   String
  statusId     String
  approverId   String?
  
  requester    User            @relation("RequesterRequests", fields: [requesterId], references: [id])
  department   Department      @relation(fields: [departmentId], references: [id])
  priority     RequestPriority @relation(fields: [priorityId], references: [id])
  status       RequestStatus   @relation(fields: [statusId], references: [id])
  approver     User?           @relation("ApproverRequests", fields: [approverId], references: [id])
  
  reason       String
  requestDate  DateTime
  workOrder    String?
  step         Int      @default(1)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  items MaterialRequestItem[]

  @@map("material_requests")
}
```

### 3.3 Update MaterialRequestItem Model

```prisma
model MaterialRequestItem {
  id                String   @id @default(uuid())
  requestId         String
  materialId        String
  unitId            String
  requestedQuantity Int
  stock             Int
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  request  MaterialRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  material Material        @relation(fields: [materialId], references: [id])
  unit     MaterialUnit    @relation(fields: [unitId], references: [id])

  @@map("material_request_items")
}
```

### 3.4 Update User Model (add relations)

```prisma
model User {
  // ... existing fields ...
  
  // Add new relations
  requestedMaterialRequests MaterialRequest[] @relation("RequesterRequests")
  approvedMaterialRequests  MaterialRequest[] @relation("ApproverRequests")
}
```

### 3.5 Update Department Model (add relation)

```prisma
model Department {
  // ... existing fields ...
  
  // Add new relation
  materialRequests MaterialRequest[]
}
```

### 3.6 Update Material Model (add relation)

```prisma
model Material {
  // ... existing fields ...
  
  // Add new relation
  requestItems MaterialRequestItem[]
}
```

---

## 4. Phase 2: Seed Data

### 4.1 RequestPriority Seed Data

| Code | Name | Color | Sort Order |
|------|------|-------|------------|
| `NORMAL` | Bình thường | `#3B82F6` (Blue) | 1 |
| `URGENT` | Khẩn cấp | `#EF4444` (Red) | 2 |

### 4.2 RequestStatus Seed Data

| Code | Name | Color | Sort Order |
|------|------|-------|------------|
| `PENDING` | Chờ duyệt | `#F59E0B` (Yellow) | 1 |
| `APPROVED` | Đã duyệt | `#10B981` (Green) | 2 |
| `COMPLETED` | Hoàn thành | `#3B82F6` (Blue) | 3 |
| `REJECTED` | Từ chối | `#EF4444` (Red) | 4 |
| `CANCELLED` | Hủy | `#6B7280` (Gray) | 5 |

### 4.3 Seed Script Update

```typescript
// In prisma/seed.ts

// RequestPriority
const requestPriorities = [
  { code: 'NORMAL', name: 'Bình thường', color: '#3B82F6', sortOrder: 1 },
  { code: 'URGENT', name: 'Khẩn cấp', color: '#EF4444', sortOrder: 2 },
];

for (const item of requestPriorities) {
  await prisma.requestPriority.upsert({
    where: { code: item.code },
    update: item,
    create: item,
  });
}

// RequestStatus
const requestStatuses = [
  { code: 'PENDING', name: 'Chờ duyệt', color: '#F59E0B', sortOrder: 1 },
  { code: 'APPROVED', name: 'Đã duyệt', color: '#10B981', sortOrder: 2 },
  { code: 'COMPLETED', name: 'Hoàn thành', color: '#3B82F6', sortOrder: 3 },
  { code: 'REJECTED', name: 'Từ chối', color: '#EF4444', sortOrder: 4 },
  { code: 'CANCELLED', name: 'Hủy', color: '#6B7280', sortOrder: 5 },
];

for (const item of requestStatuses) {
  await prisma.requestStatus.upsert({
    where: { code: item.code },
    update: item,
    create: item,
  });
}
```

---

## 5. Phase 3: API Routes

### 5.1 Master Data API Endpoints

**Cần tạo mới:**
- `GET /api/master-data/request-priority` 
- `GET /api/master-data/request-status`

**File:** `src/app/api/master-data/request-priority/route.ts`
**File:** `src/app/api/master-data/request-status/route.ts`

### 5.2 Update Material Request API

**File:** `src/app/api/material-requests/route.ts`

**GET Response:** Include related data
```typescript
const requests = await prisma.materialRequest.findMany({
  include: {
    requester: { select: { id: true, name: true } },
    department: { select: { id: true, name: true } },
    priority: { select: { id: true, name: true, color: true } },
    status: { select: { id: true, name: true, color: true } },
    approver: { select: { id: true, name: true } },
    items: {
      include: {
        material: { select: { id: true, code: true, name: true, partNumber: true } },
        unit: { select: { id: true, name: true } },
      },
    },
  },
});
```

**POST/PUT Body:** Accept FK IDs
```typescript
{
  requesterId: string;
  departmentId: string;
  priorityId: string;
  statusId?: string;
  approverId?: string;
  reason: string;
  requestDate: string;
  workOrder?: string;
  items: Array<{
    materialId: string;
    unitId: string;
    requestedQuantity: number;
    stock: number;
    notes?: string;
  }>;
}
```

---

## 6. Phase 4: Frontend Updates

### 6.1 Update TypeScript Types

**File:** `src/lib/types.ts`

```typescript
export interface MaterialRequest {
  id: string;
  requestCode: string;
  
  // FK IDs
  requesterId: string;
  departmentId: string;
  priorityId: string;
  statusId: string;
  approverId?: string;
  
  // Nested relations
  requester: { id: string; name: string };
  department: MasterDataItem;
  priority: MasterDataItem;
  status: MasterDataItem;
  approver?: { id: string; name: string };
  
  reason: string;
  requestDate: string;
  workOrder?: string;
  step: number;
  items: MaterialRequestItem[];
}

export interface MaterialRequestItem {
  id: string;
  requestId: string;
  materialId: string;
  unitId: string;
  
  // Nested relations
  material: {
    id: string;
    code: string;
    name: string;
    partNumber: string;
  };
  unit: MasterDataItem;
  
  requestedQuantity: number;
  stock: number;
  notes?: string;
}
```

### 6.2 Update Request Form

**File:** `src/app/material-requests/_components/request-form.tsx`

**Changes:**
1. Fetch master data from APIs:
   - `/api/master-data/department`
   - `/api/master-data/request-priority`
   - `/api/master-data/request-status`
   - `/api/users` (for requester/approver selection)
   - `/api/materials` (for material selection)
   - `/api/master-data/material-unit`

2. Replace hardcoded Select options with dynamic data
3. Update form schema to use FK IDs:
```typescript
const formSchema = z.object({
  requesterId: z.string({ required_error: "Vui lòng chọn người yêu cầu." }),
  departmentId: z.string({ required_error: "Vui lòng chọn đơn vị." }),
  priorityId: z.string({ required_error: "Vui lòng chọn độ ưu tiên." }),
  // ... other fields
});
```

### 6.3 Update Requests Client

**File:** `src/app/material-requests/_components/requests-client.tsx`

**Changes:**
1. Filter dropdowns fetch from master data APIs
2. Display names from nested relations (e.g., `request.priority.name`)
3. Use badge colors from master data (e.g., `request.status.color`)

### 6.4 Update Hook

**File:** `src/hooks/use-material-requests.ts`

**Changes:**
1. Update TypeScript interfaces
2. Update filter parameters to use FK IDs

---

## 7. Phase 5: Testing & Verification

### 7.1 Database Migration Commands

```bash
# 1. Push schema changes
npx prisma db push

# 2. Regenerate Prisma client
npx prisma generate

# 3. Run seed
npx prisma db seed
```

### 7.2 Verification Checklist

- [x] `RequestPriority` và `RequestStatus` tables created
- [x] Seed data populated correctly (2 priorities, 5 statuses)
- [x] Master data API endpoints return correct data
- [x] Material Request list displays correctly with FK data
- [x] Create new request with FK selections works
- [x] Edit request updates FK relationships
- [x] Delete request works
- [x] Filters work with FK IDs

---

## 8. File Changes Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `prisma/schema.prisma` | UPDATE - Add models & relations |
| 2 | `prisma/seed.ts` | UPDATE - Add seed data |
| 3 | `src/app/api/master-data/request-priority/route.ts` | NEW |
| 3 | `src/app/api/master-data/request-status/route.ts` | NEW |
| 3 | `src/app/api/material-requests/route.ts` | UPDATE |
| 3 | `src/app/api/material-requests/[id]/route.ts` | UPDATE |
| 4 | `src/lib/types.ts` | UPDATE |
| 4 | `src/app/material-requests/_components/request-form.tsx` | UPDATE |
| 4 | `src/app/material-requests/_components/requests-client.tsx` | UPDATE |
| 4 | `src/hooks/use-material-requests.ts` | UPDATE |

---

## 9. Dependencies

- `RequestPriority` và `RequestStatus` tables phải được seed trước
- `User` và `Department` tables phải có data
- `Material` và `MaterialUnit` tables phải có data

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Existing MaterialRequest data uses strings | Migration script to convert string → FK lookup |
| User/Approver selection complexity | Implement searchable user selector component |
| Material selection in items table | Implement autocomplete/search material picker |
