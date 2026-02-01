---
title: "Implement Outbound Management with FK Relationships"
description: "Implement OutboundReceipt (Phiếu xuất kho) with FK relationships to master data, materials, users, and warehouse locations"
status: pending
priority: P0
effort: 2.5d
branch: main
tags: [outbound, feature, fk, prisma]
created: 2026-02-01
---

# Implement Xuất Kho (Outbound) với FK Relationships

## 1. Mục tiêu

Xây dựng module **Xuất kho** với đầy đủ FK relationships:
- FK tới `OutboundPurpose`, `OutboundStatus` (master data - đã có)
- FK tới `User` (người nhận - hiển thị Department + Name)
- FK tới `MaterialRequest` (tham chiếu yêu cầu - optional)
- FK tới `Material`, `MaterialUnit` cho items
- FK tới `WarehouseLocation` cho vị trí lấy hàng
- FK tới `User` cho người duyệt, người tạo

---

## 2. UI Analysis (từ mockups)

### List View
| Column | Field | Type |
|--------|-------|------|
| Số Phiếu | receiptCode | String (unique) |
| Mục Đích Xuất | purposeId → OutboundPurpose | FK |
| Yêu Cầu Số | materialRequestId → MaterialRequest | FK (optional) |
| Bộ Phận | (từ receiver.department) | Display only |
| Lý Do | reason | String |
| Trạng Thái | statusId → OutboundStatus | FK |
| Thao Tác | - | Actions |

### Form - 4 Steps (Workflow)
1. **Yêu cầu VT**: Tạo phiếu xuất + chọn vật tư
2. **Phê duyệt**: Người duyệt approve/reject
3. **Soạn hàng (Picking)**: Chọn vị trí kho thực tế + serial
4. **Xuất kho (Issue)**: Hoàn thành → trừ stock

### Form Fields
| Field | Type | Description |
|-------|------|-------------|
| Số Phiếu Xuất | String (auto) | PXK-2026-001 |
| Mục đích Xuất | FK → OutboundPurpose | Dropdown master data |
| Ngày xuất | DateTime | Date picker |
| Đơn vị/Người nhận | FK → User | Select với display: "Department - UserName" |
| Lý do | String | Text input |

### Chi tiết hàng xuất (OutboundReceiptItem)
| Column | Field | Type |
|--------|-------|------|
| Mã VT | materialId → Material | FK |
| Tên Vật tư | (từ Material relation) | - |
| SL YC | requestedQuantity | Int |
| SL Xuất | issuedQuantity | Int |
| ĐVT | unitId → MaterialUnit | FK |
| Lấy từ vị trí (Gợi ý) | locationId → WarehouseLocation | FK |
| Serial thực xuất | serialBatch | String? |

### Print Pages
- **In Phiếu Xuất**: Trang in phiếu xuất kho
- **In BB Bàn Giao**: Trang in biên bản bàn giao

---

## 3. Database Schema Changes

### 3.1 Update OutboundPurpose (add relation)

```prisma
model OutboundPurpose {
  // ... existing fields ...
  
  receipts OutboundReceipt[]  // ADD relation
}
```

### 3.2 Update OutboundStatus (add relation)

```prisma
model OutboundStatus {
  // ... existing fields ...
  
  receipts OutboundReceipt[]  // ADD relation
}
```

### 3.3 New OutboundReceipt Model

```prisma
model OutboundReceipt {
  id          String   @id @default(uuid())
  receiptCode String   @unique  // PXK-2026-001
  
  // FK Relations
  purposeId           String
  statusId            String
  receiverId          String              // Người/đơn vị nhận
  materialRequestId   String?             // Optional - tham chiếu từ yêu cầu VT
  createdById         String
  approverId          String?             // Người duyệt (step 2)
  
  purpose         OutboundPurpose    @relation(fields: [purposeId], references: [id])
  status          OutboundStatus     @relation(fields: [statusId], references: [id])
  receiver        User               @relation("OutboundReceiver", fields: [receiverId], references: [id])
  materialRequest MaterialRequest?   @relation(fields: [materialRequestId], references: [id])
  createdBy       User               @relation("OutboundCreator", fields: [createdById], references: [id])
  approver        User?              @relation("OutboundApprover", fields: [approverId], references: [id])
  
  reason          String?
  outboundDate    DateTime
  approvedAt      DateTime?
  issuedAt        DateTime?
  notes           String?
  step            Int        @default(1)  // 1-4 for stepper
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  items OutboundReceiptItem[]

  @@map("outbound_receipts")
}
```

### 3.4 New OutboundReceiptItem Model

```prisma
model OutboundReceiptItem {
  id        String   @id @default(uuid())
  receiptId String
  
  // FK Relations
  materialId String
  unitId     String
  locationId String?   // Vị trí lấy hàng (assign khi picking)
  
  material   Material           @relation("OutboundItemMaterial", fields: [materialId], references: [id])
  unit       MaterialUnit       @relation("OutboundItemUnit", fields: [unitId], references: [id])
  location   WarehouseLocation? @relation("OutboundItemLocation", fields: [locationId], references: [id])
  receipt    OutboundReceipt    @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  
  requestedQuantity Int
  issuedQuantity    Int       @default(0)
  serialBatch       String?   // Serial/batch thực xuất
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("outbound_receipt_items")
}
```

### 3.5 Add Relations to Existing Models

```prisma
// Material - add relation
model Material {
  // ... existing ...
  outboundItems OutboundReceiptItem[] @relation("OutboundItemMaterial")
}

// MaterialUnit - add relation  
model MaterialUnit {
  // ... existing ...
  outboundItems OutboundReceiptItem[] @relation("OutboundItemUnit")
}

// WarehouseLocation - add relation
model WarehouseLocation {
  // ... existing ...
  outboundItems OutboundReceiptItem[] @relation("OutboundItemLocation")
}

// MaterialRequest - add relation
model MaterialRequest {
  // ... existing ...
  outboundReceipts OutboundReceipt[]
}

// User - add relations
model User {
  // ... existing ...
  receivedOutboundReceipts  OutboundReceipt[] @relation("OutboundReceiver")
  createdOutboundReceipts   OutboundReceipt[] @relation("OutboundCreator")
  approvedOutboundReceipts  OutboundReceipt[] @relation("OutboundApprover")
}
```

---

## 4. Seed Data

### OutboundPurpose (verify existing)

```typescript
// Check if already seeded in master-data, add if missing
await prisma.outboundPurpose.createMany({
  data: [
    { code: "OM", name: "Cấp O&M", sortOrder: 1 },
    { code: "PROJECT", name: "Cấp dự án", sortOrder: 2 },
    { code: "RETURN", name: "Trả NCC", sortOrder: 3 },
    { code: "TRANSFER", name: "Chuyển kho", sortOrder: 4 },
    { code: "SCRAP", name: "Thanh lý", sortOrder: 5 },
    { code: "OTHER", name: "Khác", sortOrder: 99 },
  ],
  skipDuplicates: true
})
```

### OutboundStatus (verify existing)

```typescript
// Check if already seeded in master-data, add if missing
await prisma.outboundStatus.createMany({
  data: [
    { code: "DRAFT", name: "Nháp", color: "bg-gray-100 text-gray-800", sortOrder: 1 },
    { code: "REQUESTED", name: "Yêu cầu xuất", color: "bg-blue-100 text-blue-800", sortOrder: 2 },
    { code: "APPROVED", name: "Đã duyệt", color: "bg-green-100 text-green-800", sortOrder: 3 },
    { code: "PICKING", name: "Đang soạn hàng", color: "bg-yellow-100 text-yellow-800", sortOrder: 4 },
    { code: "ISSUED", name: "Đã xuất", color: "bg-emerald-100 text-emerald-800", sortOrder: 5 },
    { code: "REJECTED", name: "Từ chối", color: "bg-red-100 text-red-800", sortOrder: 6 },
    { code: "CANCELLED", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 7 },
  ],
  skipDuplicates: true
})
```

### Sample OutboundReceipts (10-15 records)

```typescript
// Similar pattern to InboundReceipt seeding
// Include various statuses and steps for testing
```

---

## 5. API Endpoints

### 5.1 Master Data API (existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/outbound-purpose` | List purposes |
| GET | `/api/master-data/outbound-status` | List statuses |

### 5.2 Outbound Receipt API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/outbound` | List receipts with pagination, filters |
| POST | `/api/outbound` | Create new receipt |
| GET | `/api/outbound/[id]` | Get receipt detail |
| PUT | `/api/outbound/[id]` | Update receipt |
| DELETE | `/api/outbound/[id]` | Delete receipt |
| POST | `/api/outbound/[id]/approve` | Approve receipt (step 1→2) |
| POST | `/api/outbound/[id]/issue` | Complete issue → update stock |

### 5.3 Response Format

```typescript
interface OutboundReceiptResponse {
  id: string;
  receiptCode: string;
  purpose: { id: string; code: string; name: string };
  status: { id: string; code: string; name: string; color: string };
  receiver: { 
    id: string; 
    name: string;
    department: { id: string; name: string };
  };
  materialRequest?: { id: string; requestCode: string };
  createdBy: { id: string; name: string };
  approver?: { id: string; name: string };
  reason?: string;
  outboundDate: string;
  step: number;
  items: OutboundReceiptItemResponse[];
}
```

---

## 6. Frontend Components

### File Structure

```
src/app/outbound/
├── page.tsx                    # Server component
├── print/
│   ├── [id]/
│   │   └── page.tsx            # Print receipt page
│   └── handover/
│       └── [id]/
│           └── page.tsx        # Print handover report
├── _components/
│   ├── outbound-client.tsx     # Main client component
│   ├── outbound-form.tsx       # Form dialog with stepper
│   ├── outbound-items-table.tsx # Items editor
│   └── outbound-stepper.tsx    # Workflow stepper
```

### Key Components

1. **outbound-client.tsx**
   - List view with filters (purpose, status, department)
   - Search by receipt code, request code
   - Pagination
   - Actions: View, Edit, Delete, Print

2. **outbound-form.tsx**
   - 4-step stepper workflow
   - Purpose Dropdown (FK)
   - Receiver Picker (User dropdown với display "Department - Name")
   - MaterialRequest Picker (optional, để kéo items)
   - Date Picker

3. **outbound-items-table.tsx**
   - Material Picker Dialog (hoặc kéo từ MaterialRequest)
   - Quantity inputs (requested, issued)
   - Location Picker (step 3 - picking)
   - Serial/Batch input (step 3)

4. **Print Pages**
   - `/outbound/print/[id]`: Phiếu xuất kho
   - `/outbound/print/handover/[id]`: Biên bản bàn giao
   - Server-side render với CSS cho print
   - Button `window.print()` + close

---

## 7. Implementation Phases

### Phase 0: Remove Old Models (Pre-requisite)
- [ ] Delete `OutboundVoucher` model from schema (lines 897-914)
- [ ] Delete `OutboundVoucherItem` model from schema (lines 916-933)
- [ ] Run `prisma db push` to drop tables
- [ ] Verify tables removed in Prisma Studio

### Phase 1: Schema & Seed (0.5d)
- [ ] Add `OutboundReceipt` model
- [ ] Add `OutboundReceiptItem` model
- [ ] Add relations to `OutboundPurpose`, `OutboundStatus`
- [ ] Add relations to `Material`, `MaterialUnit`, `WarehouseLocation`
- [ ] Add relations to `MaterialRequest`, `User`
- [ ] Seed OutboundPurpose, OutboundStatus (nếu chưa có)
- [ ] Seed sample OutboundReceipts
- [ ] Run `prisma db push` and `prisma generate`

### Phase 2: API Routes (0.5d)
- [ ] Create `/api/outbound/route.ts` (GET, POST)
- [ ] Create `/api/outbound/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Create `/api/outbound/[id]/approve/route.ts`
- [ ] Create `/api/outbound/[id]/issue/route.ts` (stock update logic)
- [ ] Add `getOutboundReceipts()` to `lib/data.ts`
- [ ] Test APIs

### Phase 3: Frontend - List & Form (1d)
- [ ] Create `outbound-client.tsx` - list view
- [ ] Create `outbound-form.tsx` - form dialog
- [ ] Create `outbound-items-table.tsx` - items editor
- [ ] Create `outbound-stepper.tsx` - workflow steps
- [ ] Implement User picker với Department display
- [ ] Implement MaterialRequest picker (optional)
- [ ] Implement approval workflow

### Phase 4: Print Pages (0.5d)
- [ ] Create `/outbound/print/[id]/page.tsx` - Phiếu xuất kho
- [ ] Create `/outbound/print/handover/[id]/page.tsx` - BB Bàn giao
- [ ] Print-friendly CSS
- [ ] Test printing

---

## 8. File Changes Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `prisma/schema.prisma` | UPDATE - Add models + relations |
| 1 | `prisma/seed.ts` | UPDATE - Add OutboundPurpose, OutboundStatus, samples |
| 2 | `src/app/api/outbound/route.ts` | NEW |
| 2 | `src/app/api/outbound/[id]/route.ts` | NEW |
| 2 | `src/app/api/outbound/[id]/approve/route.ts` | NEW |
| 2 | `src/app/api/outbound/[id]/issue/route.ts` | NEW |
| 2 | `src/lib/data.ts` | UPDATE - Add getOutboundReceipts() |
| 3 | `src/app/outbound/page.tsx` | NEW |
| 3 | `src/app/outbound/_components/*.tsx` | NEW (4 files) |
| 4 | `src/app/outbound/print/[id]/page.tsx` | NEW |
| 4 | `src/app/outbound/print/handover/[id]/page.tsx` | NEW |
| 3 | `src/lib/types.ts` | UPDATE - Add types |

---

## 9. Verification Checklist

- [ ] Schema migrations successful
- [ ] Seed data populated (purposes, statuses, samples)
- [ ] API endpoints return correct data with nested relations
- [ ] List view displays all columns correctly
- [ ] Filters work (by purpose, status, department)
- [ ] Create form with Receiver picker works (display Dept - Name)
- [ ] MaterialRequest picker pulls items correctly
- [ ] Items table with Material picker works
- [ ] Location picker works (step 3)
- [ ] Approval workflow works (step 2)
- [ ] Issue flow updates stock correctly (step 4)
- [ ] Print Phiếu Xuất works
- [ ] Print BB Bàn Giao works

---

## 10. Design Decisions

1. **Receiver** = FK to `User`, dropdown hiển thị "Department - UserName"
2. **YÊU CẦU SỐ** = Optional FK to `MaterialRequest`, có thể kéo items
3. **Workflow** = `step` field (1-4, maps to stepper UI)
4. **Stock Update** = Chỉ trừ stock khi step 4 (ISSUED)
5. **Print** = Trang mới với CSS print-friendly, không export PDF
6. **Vị trí** = FK to `WarehouseLocation`, gán khi picking (step 3)

---

## 11. Clarified Requirements (User Confirmed)

| # | Question | Decision |
|---|----------|----------|
| 1 | **Existing Data** | Không có data cũ, tạo mới hoàn toàn |
| 2 | **Partial Fulfillment** | ✅ Cho phép xuất ít hơn SL yêu cầu và đóng phiếu |
| 3 | **Approval Chain** | Single approver (1 người duyệt) |
| 4 | **MaterialRequest Integration** | Auto-populate items từ MR, có thể chỉnh sửa |
| 5 | **Serial/Batch Tracking** | Bắt buộc tùy theo `Material.managementType` |

### Implementation Notes

**Partial Fulfillment Logic:**
- `requestedQuantity` = Số lượng yêu cầu ban đầu
- `issuedQuantity` = Số lượng thực xuất (có thể < requested)
- Khi hoàn thành (step 4), trừ stock theo `issuedQuantity`
- Không tạo backorder, chỉ đóng phiếu

**MaterialRequest Auto-populate:**
```typescript
// When selecting MaterialRequest, auto-populate items:
const items = materialRequest.items.map(item => ({
  materialId: item.materialId,
  unitId: item.unitId,
  requestedQuantity: item.requestedQuantity,
  issuedQuantity: 0,  // User fills during picking
  // locationId, serialBatch assigned during step 3
}));
```

**Serial/Batch Validation:**
```typescript
// Check if serial/batch is required based on managementType
const requiresSerial = material.managementType.code === 'SERIAL';
const requiresBatch = material.managementType.code === 'BATCH';

if ((requiresSerial || requiresBatch) && !item.serialBatch) {
  throw new Error(`Serial/Batch bắt buộc cho ${material.name}`);
}
```

---

## 12. Effort Estimate (Revised)

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Schema & Seed | 0.5d |
| 2 | API Routes | 0.5d |
| 3 | Frontend (List, Form, Pickers) | 1.5d |
| 4 | Print Pages | 0.5d |
| **Total** | | **3d**
