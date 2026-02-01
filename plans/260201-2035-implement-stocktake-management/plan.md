---
title: "Implement Stocktake Management with FK Relationships"
description: "Implement Stocktake (Kiểm kê kho) with FK relationships to master data, materials, users, and warehouse locations"
status: pending
priority: P1
effort: 2.5d
branch: main
tags: [stocktake, inventory, feature, fk, prisma]
created: 2026-02-01
---

# Implement Kiểm Kê Kho (Stocktake) với FK Relationships

## 1. Mục tiêu

Xây dựng module **Kiểm kê kho** với đầy đủ FK relationships:
- FK tới `StocktakeStatus` (master data - đã có)
- FK tới `StocktakeArea` (phạm vi kiểm kê - master data - đã có)
- FK tới `User` (người tạo, người phụ trách từng location)
- FK tới `Material`, `MaterialUnit` cho kết quả
- FK tới `WarehouseLocation` cho vị trí kiểm kê cụ thể
- Tự động điều chỉnh stock khi hoàn thành

> **Note**: `StocktakeArea` = phạm vi kiểm kê (logical), `WarehouseLocation` = vị trí vật lý.

---

## 2. Workflow (3 Steps)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. TẠO ĐỢT │ →  │ 2. KIỂM ĐẾM │ →  │ 3. ĐỐI SOÁT │ →  │ HOÀN THÀNH  │
│    (DRAFT)  │    │  (COUNTING) │    │(RECONCILING)│    │ (COMPLETED) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
   Chọn khu vực      Phân công         Nhập số liệu      Xác nhận &
   + ngày kiểm kê    người đếm         thực tế           cập nhật stock
```

### Step Details:
1. **Tạo đợt (DRAFT)**: Chọn khu vực, ngày, tên đợt kiểm kê
2. **Kiểm đếm (COUNTING)**: Phân công người theo location, nhập số liệu
3. **Đối soát (RECONCILING)**: So sánh book vs actual, ghi nhận chênh lệch
4. **Hoàn thành (COMPLETED)**: Xác nhận → Auto update stock

---

## 3. Database Schema

### 3.1 Update StocktakeStatus (add relation)

```prisma
model StocktakeStatus {
  // ... existing fields ...
  
  stocktakes Stocktake[]  // ADD relation
}
```

### 3.2 New Stocktake Model (replace old StockTake)

```prisma
model Stocktake {
  id           String   @id @default(uuid())
  takeCode     String   @unique  // KK-2026-001
  name         String   // "Kiểm kê tháng 1/2026"
  
  // FK Relations
  statusId     String
  areaId       String              // Phạm vi kiểm kê (StocktakeArea)
  createdById  String
  
  status       StocktakeStatus     @relation(fields: [statusId], references: [id])
  area         StocktakeArea       @relation(fields: [areaId], references: [id])
  createdBy    User                @relation("StocktakeCreator", fields: [createdById], references: [id])
  
  takeDate     DateTime            // Ngày kiểm kê
  notes        String?
  step         Int      @default(1)  // 1-3 for stepper
  completedAt  DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assignments  StocktakeAssignment[]
  results      StocktakeResult[]

  @@map("stocktakes")
}
```

### 3.3 New StocktakeAssignment (phân công theo location)

```prisma
model StocktakeAssignment {
  id           String   @id @default(uuid())
  stocktakeId  String
  locationId   String
  assigneeId   String
  
  stocktake    Stocktake         @relation(fields: [stocktakeId], references: [id], onDelete: Cascade)
  location     WarehouseLocation @relation("StocktakeLocation", fields: [locationId], references: [id])
  assignee     User              @relation("StocktakeAssignee", fields: [assigneeId], references: [id])
  
  status       String   @default("pending")  // pending, counting, completed
  completedAt  DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([stocktakeId, locationId])
  @@map("stocktake_assignments")
}
```

### 3.4 New StocktakeResult (replace old StockTakeResult)

```prisma
model StocktakeResult {
  id             String   @id @default(uuid())
  stocktakeId    String
  
  // FK Relations
  materialId     String
  locationId     String
  unitId         String
  countedById    String     // Người đếm
  
  stocktake      Stocktake         @relation(fields: [stocktakeId], references: [id], onDelete: Cascade)
  material       Material          @relation("StocktakeMaterial", fields: [materialId], references: [id])
  location       WarehouseLocation @relation("StocktakeResultLocation", fields: [locationId], references: [id])
  unit           MaterialUnit      @relation("StocktakeResultUnit", fields: [unitId], references: [id])
  countedBy      User              @relation("StocktakeCounter", fields: [countedById], references: [id])
  
  bookQuantity   Int         // Số lượng sổ sách
  actualQuantity Int         // Số lượng thực tế
  variance       Int         // Chênh lệch = actual - book
  serialBatch    String?     // Serial/batch nếu có
  notes          String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([stocktakeId, materialId, locationId])
  @@map("stocktake_results")
}
```

### 3.5 Add Relations to Existing Models

```prisma
// StocktakeStatus - add relation
model StocktakeStatus {
  // ... existing ...
  stocktakes Stocktake[]
}

// StocktakeArea - add relation  
model StocktakeArea {
  // ... existing ...
  stocktakes Stocktake[]
}

// WarehouseLocation - add relations
model WarehouseLocation {
  // ... existing ...
  stocktakeAssignments StocktakeAssignment[] @relation("StocktakeLocation")
  stocktakeResults     StocktakeResult[]     @relation("StocktakeResultLocation")
}

// WarehouseItem - ADD UNIQUE CONSTRAINT + MATERIAL FK (Critical for stock update)
model WarehouseItem {
  // ... existing fields ...
  materialId String
  
  material Material @relation("WarehouseItemMaterial", fields: [materialId], references: [id])  // ADD FK
  
  @@unique([locationId, materialId])  // ADD UNIQUE
}

// Material - add relation
model Material {
  // ... existing ...
  stocktakeResults StocktakeResult[] @relation("StocktakeMaterial")
}

// MaterialUnit - add relation
model MaterialUnit {
  // ... existing ...
  stocktakeResults StocktakeResult[] @relation("StocktakeResultUnit")
}

// User - add relations
model User {
  // ... existing ...
  createdStocktakes     Stocktake[]           @relation("StocktakeCreator")
  stocktakeAssignments  StocktakeAssignment[] @relation("StocktakeAssignee")
  stocktakeResults      StocktakeResult[]     @relation("StocktakeCounter")
}
```

---

## 4. Seed Data

### StocktakeStatus (verify/add)

```typescript
await prisma.stocktakeStatus.createMany({
  data: [
    { code: "DRAFT", name: "Nháp", color: "bg-gray-100 text-gray-800", sortOrder: 1 },
    { code: "COUNTING", name: "Đang kiểm đếm", color: "bg-blue-100 text-blue-800", sortOrder: 2 },
    { code: "RECONCILING", name: "Đang đối soát", color: "bg-yellow-100 text-yellow-800", sortOrder: 3 },
    { code: "COMPLETED", name: "Hoàn thành", color: "bg-green-100 text-green-800", sortOrder: 4 },
    { code: "CANCELLED", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 5 },
  ],
  skipDuplicates: true
})
```

### Sample Stocktakes (5-10 records)

```typescript
// Various statuses and steps for testing
// Include assignments and results
```

---

## 5. API Endpoints

### 5.1 Stocktake API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocktake` | List stocktakes with filters |
| POST | `/api/stocktake` | Create new stocktake |
| GET | `/api/stocktake/[id]` | Get stocktake detail |
| PUT | `/api/stocktake/[id]` | Update stocktake |
| DELETE | `/api/stocktake/[id]` | Delete stocktake |
| POST | `/api/stocktake/[id]/start` | Start counting (step 1→2) |
| POST | `/api/stocktake/[id]/reconcile` | Start reconciliation (step 2→3) |
| POST | `/api/stocktake/[id]/complete` | Complete & update stock |

### 5.2 Assignment API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocktake/[id]/assignments` | List assignments |
| POST | `/api/stocktake/[id]/assignments` | Add assignment |
| PUT | `/api/stocktake/[id]/assignments/[assignId]` | Update assignment |
| DELETE | `/api/stocktake/[id]/assignments/[assignId]` | Remove assignment |

### 5.3 Result API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocktake/[id]/results` | List results |
| POST | `/api/stocktake/[id]/results` | Add/update single result |
| POST | `/api/stocktake/[id]/results/bulk` | **Bulk add/update results** (max 50 items) |
| PUT | `/api/stocktake/[id]/results/[resultId]` | Update result |

> **Note**: Bulk API cho phép nhập nhiều kết quả 1 lần, tối ưu UX khi kiểm đếm.

### 5.4 Step Validation Logic

```typescript
// API must validate step transitions - cannot skip steps
function validateStepTransition(currentStep: number, action: string) {
  const validTransitions = {
    1: ['start'],      // DRAFT -> COUNTING
    2: ['reconcile'],  // COUNTING -> RECONCILING  
    3: ['complete'],   // RECONCILING -> COMPLETED
  };
  
  if (!validTransitions[currentStep]?.includes(action)) {
    throw new Error(`Cannot ${action} from step ${currentStep}`);
  }
}
```

### 5.5 Response Format

```typescript
interface StocktakeResponse {
  id: string;
  takeCode: string;
  name: string;
  status: { id: string; code: string; name: string; color: string };
  area: { id: string; code: string; name: string };
  createdBy: { id: string; name: string };
  takeDate: string;
  step: number;
  notes?: string;
  completedAt?: string;
  assignments: StocktakeAssignmentResponse[];
  results: StocktakeResultResponse[];
  // Summary
  totalLocations: number;
  completedLocations: number;
  totalVariance: number;
}
```

---

## 6. Frontend Components

### File Structure

```
src/app/stocktake/
├── page.tsx                    # Server component
├── _components/
│   ├── stocktake-client.tsx    # Main client component
│   ├── stocktake-form.tsx      # Create/edit form
│   ├── stocktake-stepper.tsx   # Workflow steps
│   ├── assignment-table.tsx    # Location assignments
│   └── result-table.tsx        # Count results
```

### Key Components

1.  **stocktake-client.tsx**
    - List view with filters (status, area, date range)
    - Search by takeCode, name
    - Pagination + Actions

2.  **stocktake-form.tsx**
    - Name, Date picker
    - Area Dropdown (WarehouseArea FK)
    - Stepper navigation

3.  **assignment-table.tsx**
    - List locations in selected area
    - Assign User to each location
    - Status per location

4.  **result-table.tsx**
    - Material list by location
    - Book vs Actual quantity
    - Variance highlight (red if negative)
    - Notes input

---

## 7. Implementation Phases

### Pre-Phase 0: Confirmation & Backup
- [ ] Verify no data exists in `stock_takes` table
- [ ] Run `prisma db push --dry-run` to preview changes
- [ ] Confirm with user before proceeding

### Phase 0: Remove Old Models
- [ ] Delete `StockTake` model from schema (lines 964-978)
- [ ] Delete `StockTakeResult` model from schema (lines 980-996)
- [ ] Run `prisma db push` to drop tables
- [ ] Verify tables removed in Prisma Studio

### Phase 1: Schema & Seed (0.5d)
- [ ] Add `Stocktake` model
- [ ] Add `StocktakeAssignment` model
- [ ] Add `StocktakeResult` model
- [ ] Add relations to `StocktakeStatus`
- [ ] Add relations to `WarehouseArea`, `WarehouseLocation`
- [ ] Add relations to `Material`, `MaterialUnit`, `User`
- [ ] Update seed data for StocktakeStatus
- [ ] Add sample Stocktakes with assignments & results
- [ ] Run `prisma db push` and `prisma generate`

### Phase 2: API Routes (0.5d)
- [ ] Create `/api/stocktake/route.ts` (GET, POST)
- [ ] Create `/api/stocktake/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Create `/api/stocktake/[id]/start/route.ts`
- [ ] Create `/api/stocktake/[id]/reconcile/route.ts`
- [ ] Create `/api/stocktake/[id]/complete/route.ts` (stock update with transaction)
- [ ] Create assignment APIs:
  - `/api/stocktake/[id]/assignments/route.ts` (GET, POST)
  - `/api/stocktake/[id]/assignments/[assignId]/route.ts` (PUT, DELETE)
- [ ] Create result APIs (including **bulk endpoint**)
- [ ] Create `src/lib/validations/stocktake.ts` (Zod schemas)
- [ ] Add TypeScript interfaces to `src/lib/types.ts`
- [ ] Add `getStocktakes()` to `lib/data.ts`
- [ ] Add step transition validation
- [ ] Test APIs

### Phase 3: Frontend (1.5d)
- [ ] Create `stocktake-client.tsx` - list view with loading skeletons
- [ ] Create `stocktake-form.tsx` - form dialog
- [ ] Create `stocktake-stepper.tsx` - workflow steps
- [ ] Create `assignment-table.tsx` - location assignments
- [ ] Create `result-table.tsx` - bulk entry with save all
- [ ] Implement Area picker
- [ ] Implement User assignment per location
- [ ] Implement variance calculation
- [ ] **Update navigation/sidebar** to include Stocktake link
- [ ] Add error handling patterns
- [ ] Test full workflow

---

## 8. Stock Update Logic

Khi hoàn thành kiểm kê (step 3 → COMPLETED):

```typescript
async function updateStockFromStocktake(stocktakeId: string) {
  const results = await prisma.stocktakeResult.findMany({
    where: { stocktakeId, variance: { not: 0 } },
    include: { material: true, location: true }
  });

  // Use transaction for atomicity
  await prisma.$transaction(async (tx) => {
    for (const result of results) {
      // CHECK WarehouseItem exists - ERROR if not (no auto-create)
      const warehouseItem = await tx.warehouseItem.findUnique({
        where: {
          locationId_materialId: {
            locationId: result.locationId,
            materialId: result.materialId
          }
        }
      });

      if (!warehouseItem) {
        throw new Error(
          `WarehouseItem không tồn tại cho ${result.material.name} tại ${result.location.code}. ` +
          `Vui lòng nhập kho trước khi kiểm kê.`
        );
      }

      // Update existing WarehouseItem quantity
      await tx.warehouseItem.update({
        where: {
          locationId_materialId: {
            locationId: result.locationId,
            materialId: result.materialId
          }
        },
        data: { quantity: result.actualQuantity }
      });

      // Update Material stock (sum all locations)
      const totalStock = await tx.warehouseItem.aggregate({
        where: { materialId: result.materialId },
        _sum: { quantity: true }
      });

      await tx.material.update({
        where: { id: result.materialId },
        data: { stock: totalStock._sum.quantity || 0 }
      });

      // Log inventory change
      await tx.inventoryLog.create({
        data: {
          materialId: result.materialId,
          materialName: result.material.name,
          quantity: result.variance,
          type: result.variance > 0 ? 'adjustment_in' : 'adjustment_out',
          date: new Date(),
          actor: 'Stocktake System',
        }
      });
    }
  });
}
```

> **Important**: 
> - WarehouseItem MUST exist before stocktake - no auto-create
> - After COMPLETED, cannot cancel/revert - create new stocktake to undo

---

## 9. File Changes Summary

| Phase | File | Action |
|-------|------|--------|
| 0 | `prisma/schema.prisma` | DELETE old StockTake models |
| 1 | `prisma/schema.prisma` | ADD new Stocktake models + relations |
| 1 | `prisma/seed.ts` | UPDATE - Add StocktakeStatus, samples |
| 2 | `src/app/api/stocktake/route.ts` | NEW |
| 2 | `src/app/api/stocktake/[id]/route.ts` | NEW |
| 2 | `src/app/api/stocktake/[id]/*/route.ts` | NEW (3 files) |
| 2 | `src/lib/data.ts` | UPDATE - Add getStocktakes() |
| 3 | `src/app/stocktake/page.tsx` | UPDATE |
| 3 | `src/app/stocktake/_components/*.tsx` | NEW/UPDATE (5 files) |
| 3 | `src/lib/types.ts` | UPDATE - Add types |

---

## 10. Clarified Requirements (User Confirmed)

| # | Question | Decision |
|---|----------|----------|
| 1 | **Existing Data** | Không có data cũ, xóa model cũ tạo mới |
| 2 | **Workflow** | 3 bước: Tạo đợt → Kiểm đếm → Đối soát → Hoàn thành |
| 3 | **Phạm vi** | Theo StocktakeArea (master data) |
| 4 | **Người thực hiện** | Phân theo location (mỗi location 1 người) |
| 5 | **Điều chỉnh stock** | ✅ Tự động update stock khi hoàn thành |
| 6 | **In báo cáo** | Không cần |
| 7 | **Bulk Result API** | ✅ Nhập hàng loạt, max 50 items |
| 8 | **WarehouseItem không tồn tại** | Báo lỗi - Yêu cầu nhập kho trước |
| 9 | **Hủy sau COMPLETED** | Không cho phép - Tạo đợt mới để undo |
| 10 | **WarehouseItem.materialId** | Không có data, thêm FK trực tiếp |
| 11 | **bookQuantity source** | Snapshot từ WarehouseItem.quantity khi tạo |
| 12 | **Authorization** | Dùng chung role hiện tại |

### bookQuantity Population Logic

```typescript
// When starting stocktake (step 1 -> 2), populate results with book quantities
async function populateBookQuantities(stocktakeId: string) {
  const stocktake = await prisma.stocktake.findUnique({
    where: { id: stocktakeId },
    include: { assignments: true }
  });

  for (const assignment of stocktake.assignments) {
    // Get all materials at this location
    const warehouseItems = await prisma.warehouseItem.findMany({
      where: { locationId: assignment.locationId }
    });

    for (const item of warehouseItems) {
      await prisma.stocktakeResult.create({
        data: {
          stocktakeId,
          materialId: item.materialId,
          locationId: item.locationId,
          unitId: item.unitId, // From WarehouseItem
          countedById: assignment.assigneeId,
          bookQuantity: item.quantity,  // SNAPSHOT at this moment
          actualQuantity: 0,            // User fills in
          variance: 0,                  // Auto-calculated
        }
      });
    }
  }
}
```

### Variance Auto-Calculation

```typescript
// When updating actualQuantity, auto-calculate variance
async function updateResult(resultId: string, actualQuantity: number) {
  const result = await prisma.stocktakeResult.findUnique({
    where: { id: resultId }
  });

  await prisma.stocktakeResult.update({
    where: { id: resultId },
    data: {
      actualQuantity,
      variance: actualQuantity - result.bookQuantity  // Auto-calculate
    }
  });
}
```

---

## 11. Verification Checklist

### Schema & Data
- [ ] Old StockTake tables removed
- [ ] New Stocktake models created with FK relations  
- [ ] `StocktakeStatus` has `stocktakes[]` relation
- [ ] `StocktakeArea` has `stocktakes[]` relation
- [ ] `WarehouseItem` has `@@unique([locationId, materialId])` constraint
- [ ] Seed data populated (statuses, sample stocktakes)

### API & Logic
- [ ] API endpoints return correct data with relations
- [ ] Step transitions validate (cannot skip steps)
- [ ] Bulk result API limits batch size (50-100 items)
- [ ] Complete workflow uses transaction
- [ ] Stock update handles upsert correctly
- [ ] Variance auto-recalculated when results updated

### Frontend
- [ ] List view displays correctly with filters
- [ ] Create stocktake with StocktakeArea selection works
- [ ] Assignment table shows locations for selected area
- [ ] User assignment per location works
- [ ] Result bulk entry works with "Save All"
- [ ] Navigation/sidebar updated with Stocktake link
- [ ] Loading skeletons and error states work

---

## 12. Effort Estimate

| Phase | Task | Estimate |
|-------|------|----------|
| 0 | Remove Old Models | 0.1d |
| 1 | Schema & Seed | 0.5d |
| 2 | API Routes | 0.5d |
| 3 | Frontend | 1.5d |
| **Total** | | **2.5d**
