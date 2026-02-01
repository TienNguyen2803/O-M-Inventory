---
title: "Implement Purchase Request Feature with FK Relationships"
description: "Refactor PurchaseRequest model to use FK for master data, integrate API and frontend"
status: completed
priority: P0
effort: 2d
branch: main
---

# Purchase Request Feature Implementation Plan

## 1. Mục tiêu

Refactor `PurchaseRequest` và `PurchaseRequestItem` models để sử dụng Foreign Key relationships với các master data tables, thay vì lưu String. Đảm bảo consistency với pattern đã áp dụng cho `MaterialRequest`, `Supplier` và `WarehouseLocation`.

## 2. Phạm vi thay đổi

### 2.1 Schema Migration

**PurchaseRequest:**
| Field | Current | Target |
|-------|---------|--------|
| `requesterName` | String | FK → `User.id` (`requesterId`) |
| `requesterDept` | String | FK → `Department.id` (`departmentId`) |
| `status` | String | FK → `RequestStatus.id` (`statusId`) |
| `source` | String | FK → `MaterialOrigin.id` (`sourceId`) |
| `fundingSource` | String | FK → `FundingSource.id` (`fundingSourceId`) |

**PurchaseRequestItem:**
| Field | Current | Target |
|-------|---------|--------|
| `unit` | String | FK → `MaterialUnit.id` (`unitId`) |
| `suggestedSupplier` | String | FK → `Supplier.id` (`suggestedSupplierId`, nullable) |
| `name` | String | FK → `Material.id` (`materialId`) - **Required**, get name from Material |

---

## 3. Phase 1: Schema Migration

### 3.1 Tạo Master Data Tables mới

```prisma
// === YÊU CẦU MUA SẮM (3 bảng mới) ===

model MaterialOrigin {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  purchaseRequests PurchaseRequest[]

  @@map("material_origins")
}

model FundingSource {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  purchaseRequests PurchaseRequest[]

  @@map("funding_sources")
}
```

### 3.2 Update PurchaseRequest Model

```prisma
model PurchaseRequest {
  id            String   @id @default(uuid())
  requestCode   String   @unique
  
  // FK Relations
  requesterId     String
  departmentId    String
  statusId        String
  sourceId        String
  fundingSourceId String
  
  requester     User            @relation("PurchaseRequesterRequests", fields: [requesterId], references: [id])
  department    Department      @relation("PurchaseDepartment", fields: [departmentId], references: [id])
  status        RequestStatus   @relation("PurchaseStatus", fields: [statusId], references: [id])
  source        MaterialOrigin  @relation(fields: [sourceId], references: [id])
  fundingSource FundingSource   @relation(fields: [fundingSourceId], references: [id])
  
  description   String
  totalAmount   Float
  step          Int?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  items PurchaseRequestItem[]

  @@map("purchase_requests")
}
```

### 3.3 Update PurchaseRequestItem Model

```prisma
model PurchaseRequestItem {
  id                  String   @id @default(uuid())
  requestId           String
  materialId          String   // Required - link to inventory Material
  unitId              String
  quantity            Int
  estimatedPrice      Float
  suggestedSupplierId String?  // FK to Supplier (nullable)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  request           PurchaseRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  material          Material        @relation("PurchaseItemMaterial", fields: [materialId], references: [id])
  unit              MaterialUnit    @relation("PurchaseItemUnit", fields: [unitId], references: [id])
  suggestedSupplier Supplier?       @relation("PurchaseSuggestedSupplier", fields: [suggestedSupplierId], references: [id])

  @@map("purchase_request_items")
}
```

### 3.4 Update Related Models (add relations)

```prisma
// User
model User {
  // ... existing fields ...
  purchaseRequests PurchaseRequest[] @relation("PurchaseRequesterRequests")
}

// Department
model Department {
  // ... existing fields ...
  purchaseRequests PurchaseRequest[] @relation("PurchaseDepartment")
}

// RequestStatus
model RequestStatus {
  // ... existing fields ...
  purchaseRequests PurchaseRequest[] @relation("PurchaseStatus")
}

// MaterialUnit
model MaterialUnit {
  // ... existing fields ...
  purchaseRequestItems PurchaseRequestItem[] @relation("PurchaseItemUnit")
}

// Supplier
model Supplier {
  // ... existing fields ...
  suggestedPurchaseItems PurchaseRequestItem[] @relation("PurchaseSuggestedSupplier")
}

// Material
model Material {
  // ... existing fields ...
  purchaseRequestItems PurchaseRequestItem[] @relation("PurchaseItemMaterial")
}
```

---

## 4. Phase 2: Seed Data

### 4.1 MaterialOrigin Seed Data

| Code | Name | Sort Order |
|------|------|------------|
| `DOMESTIC` | Trong nước | 1 |
| `IMPORT` | Nhập khẩu | 2 |

### 4.2 FundingSource Seed Data

| Code | Name | Sort Order |
|------|------|------------|
| `SCL` | Sửa chữa lớn | 1 |
| `DTXD` | Đầu tư xây dựng | 2 |
| `QDTX` | Quỹ đầu tư | 3 |

### 4.3 Seed Script Update

```typescript
// In prisma/seed.ts

// MaterialOrigin
const materialOrigins = [
  { code: 'DOMESTIC', name: 'Trong nước', sortOrder: 1 },
  { code: 'IMPORT', name: 'Nhập khẩu', sortOrder: 2 },
];

for (const item of materialOrigins) {
  await prisma.materialOrigin.upsert({
    where: { code: item.code },
    update: item,
    create: item,
  });
}

// FundingSource
const fundingSources = [
  { code: 'SCL', name: 'Sửa chữa lớn', sortOrder: 1 },
  { code: 'DTXD', name: 'Đầu tư xây dựng', sortOrder: 2 },
  { code: 'QDTX', name: 'Quỹ đầu tư', sortOrder: 3 },
];

for (const item of fundingSources) {
  await prisma.fundingSource.upsert({
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
- `GET /api/master-data/material-origin` 
- `GET /api/master-data/funding-source`

**File:** `src/app/api/master-data/material-origin/route.ts`
**File:** `src/app/api/master-data/funding-source/route.ts`

### 5.2 CRUD API cho Purchase Request

**File:** `src/app/api/purchase-requests/route.ts` (NEW)
**File:** `src/app/api/purchase-requests/[id]/route.ts` (NEW)

**GET Response:** Include related data
```typescript
const requests = await prisma.purchaseRequest.findMany({
  include: {
    requester: { select: { id: true, name: true } },
    department: { select: { id: true, name: true } },
    status: { select: { id: true, name: true, color: true, code: true } },
    source: { select: { id: true, name: true } },
    fundingSource: { select: { id: true, name: true } },
    items: {
      include: {
        material: { select: { id: true, code: true, name: true } },
        unit: { select: { id: true, name: true } },
        suggestedSupplier: { select: { id: true, name: true } },
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
  statusId?: string;
  sourceId: string;
  fundingSourceId: string;
  description: string;
  items: Array<{
    materialId: string;  // Required - link to Material
    unitId: string;
    quantity: number;
    estimatedPrice: number;
    suggestedSupplierId?: string;
  }>;
}
```

---

## 6. Phase 4: Frontend Updates

### 6.1 Update TypeScript Types

**File:** `src/lib/types.ts`

```typescript
export interface PurchaseRequest {
  id: string;
  requestCode: string;
  
  // FK IDs
  requesterId: string;
  departmentId: string;
  statusId: string;
  sourceId: string;
  fundingSourceId: string;
  
  // Nested relations
  requester: { id: string; name: string };
  department: MasterDataItem;
  status: MasterDataItem & { code: string };
  source: MasterDataItem;
  fundingSource: MasterDataItem;
  
  description: string;
  totalAmount: number;
  step?: number;
  items: PurchaseRequestItem[];
}

export interface PurchaseRequestItem {
  id: string;
  requestId: string;
  materialId: string;  // Required FK
  unitId: string;
  
  // Nested relations
  material: { id: string; code: string; name: string; partNo?: string };
  unit: MasterDataItem;
  suggestedSupplier?: { id: string; name: string };
  
  quantity: number;
  estimatedPrice: number;
  suggestedSupplierId?: string;
}
```

### 6.2 Update Purchase Request Form

**File:** `src/app/purchase-requests/_components/purchase-request-form.tsx`

**Changes:**
1. Fetch master data from APIs:
   - `/api/master-data/department`
   - `/api/master-data/material-origin`
   - `/api/master-data/funding-source`
   - `/api/master-data/request-status`
   - `/api/users`
   - `/api/suppliers`
   - `/api/master-data/material-unit`

2. Replace hardcoded Select options with dynamic data

3. Update form schema to use FK IDs

4. Update item form to support Material picker and Supplier selector

### 6.3 Update Requests Client

**File:** `src/app/purchase-requests/_components/purchase-requests-client.tsx`

**Changes:**
1. Replace mock data fetch with API call
2. Filter dropdowns fetch from master data APIs
3. Display names from nested relations
4. Use badge colors from master data

### 6.4 Update Page

**File:** `src/app/purchase-requests/page.tsx`

**Changes:**
1. Fetch from API instead of mock data
2. Pass master data as props to client component

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

- [x] `MaterialOrigin` và `FundingSource` tables created
- [x] Seed data populated correctly (2 origins, 3+ funding sources)
- [x] Master data API endpoints return correct data (via dynamic route /api/master-data/[tableId])
- [x] Purchase Request list displays correctly with FK data
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
| 3 | `src/app/api/master-data/material-origin/route.ts` | NEW |
| 3 | `src/app/api/master-data/funding-source/route.ts` | NEW |
| 3 | `src/app/api/purchase-requests/route.ts` | NEW |
| 3 | `src/app/api/purchase-requests/[id]/route.ts` | NEW |
| 4 | `src/lib/types.ts` | UPDATE |
| 4 | `src/app/purchase-requests/_components/purchase-request-form.tsx` | UPDATE |
| 4 | `src/app/purchase-requests/_components/purchase-requests-client.tsx` | UPDATE |
| 4 | `src/app/purchase-requests/page.tsx` | UPDATE |
| 4 | `src/lib/data.ts` | UPDATE - Add getPurchaseRequestFromDB |

---

## 9. Dependencies

- `MaterialOrigin` và `FundingSource` tables phải được seed trước
- `RequestStatus` table đã có từ Material Request feature
- `User`, `Department`, `Supplier` tables phải có data
- `Material` và `MaterialUnit` tables phải có data

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing mock data needs migration | Medium | Clear mock data, seed fresh |
| BiddingPackage references purchaseRequestId | High | Update after PR feature complete |
| All items must be in Material table | Low | Material picker required in form |

---

## 11. Screenshots Reference

Dựa trên screenshots đã upload:
1. List view shows: Mã PR, Người YC, Nội dung, Nguồn gốc, Tổng tiền, Trạng thái
2. Create form shows: Stepper, Mã PR, Nguồn vốn, Nguồn gốc, Diễn giải mua sắm
3. Item table shows: Tên hàng hóa, ĐVT, SL, Đơn giá (EST), Thành tiền, NCC đề xuất
