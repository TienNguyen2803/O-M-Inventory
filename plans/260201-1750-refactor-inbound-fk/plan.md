---
title: "Refactor Inbound Management with FK Relationships"
description: "Refactor InboundReceipt to use FK relationships with master data, suppliers, materials, and warehouse locations"
status: completed
priority: P0
effort: 2d
branch: main
tags: [inbound, refactor, fk, prisma]
created: 2026-02-01
---

# Refactor Inbound (Nhập kho) với FK Relationships

## 1. Mục tiêu

Refactor module **Nhập kho** để sử dụng FK relationships thay vì lưu String:
- FK tới `InboundType`, `InboundStatus` (master data)
- FK tới `Supplier` (Nguồn NCC / Đối tác)
- FK tới `PurchaseRequest` (Tham chiếu PO - optional)
- FK tới `Material`, `MaterialUnit` cho items
- FK tới `WarehouseLocation` cho vị trí lưu kho
- Master data mới: `InboundDocumentType` cho loại hồ sơ

---

## 2. UI Analysis (từ mockups)

### List View
| Column | Field | Type |
|--------|-------|------|
| Số Phiếu | receiptCode | String (unique) |
| Loại Nhập | typeId → InboundType | FK |
| Tham Chiếu | purchaseRequestId → PurchaseRequest | FK (optional) |
| Ngày Nhập | inboundDate | DateTime |
| Đối Tác | supplierId → Supplier | FK |
| Trạng Thái | statusId → InboundStatus | FK |

### Form - 4 Steps
1. **Mua sắm (PO)**: Chọn PO/PR reference
2. **Yêu cầu Nhập**: Nhập thông tin phiếu + chi tiết hàng
3. **KCS & Hồ sơ**: Đánh dấu KCS + upload hồ sơ
4. **Nhập kho (GRN)**: Hoàn thành nhập kho → cập nhật stock

### Chi tiết hàng (InboundReceiptItem)
| Column | Field | Type |
|--------|-------|------|
| Mã VT | materialId → Material | FK |
| Tên Vật tư | (từ Material relation) | - |
| SL Đặt | orderedQuantity | Int |
| Đã Nhập | receivedQuantity | Int |
| Nhập Lần Này | receivingQuantity | Int |
| Serial/Batch | serialBatch | String? |
| Vị trí | locationId → WarehouseLocation | FK |
| KCS | kcs | Boolean |

### Hồ sơ chứng từ (InboundDocument)
| Column | Field | Type |
|--------|-------|------|
| Loại Hồ sơ | typeId → InboundDocumentType | FK |
| Tên File | fileName | String |
| File URL | fileUrl | String? |

---

## 3. Database Schema Changes

### 3.1 New Master Data Model

```prisma
model InboundDocumentType {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  documents InboundDocument[]

  @@map("inbound_document_types")
}
```

### 3.2 Updated InboundType (add relation)

```prisma
model InboundType {
  // ... existing fields ...
  
  receipts InboundReceipt[]  // ADD relation
}
```

### 3.3 Updated InboundStatus (add relation)

```prisma
model InboundStatus {
  // ... existing fields ...
  
  receipts InboundReceipt[]  // ADD relation
}
```

### 3.4 Refactored InboundReceipt

```prisma
model InboundReceipt {
  id          String   @id @default(uuid())
  receiptCode String   @unique  // PNK-2026-001
  
  // FK Relations
  typeId              String
  statusId            String
  supplierId          String
  purchaseRequestId   String?    // Optional - có thể nhập thủ công
  createdById         String
  
  type            InboundType       @relation(fields: [typeId], references: [id])
  status          InboundStatus     @relation(fields: [statusId], references: [id])
  supplier        Supplier          @relation("InboundSupplier", fields: [supplierId], references: [id])
  purchaseRequest PurchaseRequest?  @relation(fields: [purchaseRequestId], references: [id])
  createdBy       User              @relation("InboundCreator", fields: [createdById], references: [id])
  
  referenceCode   String?    // Mã tham chiếu thủ công (nếu không có PR)
  inboundDate     DateTime
  notes           String?
  step            Int        @default(1)  // 1-4 for stepper
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  items     InboundReceiptItem[]
  documents InboundDocument[]

  @@map("inbound_receipts")
}
```

### 3.5 Refactored InboundReceiptItem

```prisma
model InboundReceiptItem {
  id        String   @id @default(uuid())
  receiptId String
  
  // FK Relations
  materialId String
  unitId     String
  locationId String?   // Nullable - assign when receiving
  
  material   Material           @relation("InboundItemMaterial", fields: [materialId], references: [id])
  unit       MaterialUnit       @relation("InboundItemUnit", fields: [unitId], references: [id])
  location   WarehouseLocation? @relation("InboundItemLocation", fields: [locationId], references: [id])
  receipt    InboundReceipt     @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  
  orderedQuantity   Int
  receivedQuantity  Int       @default(0)
  receivingQuantity Int       @default(0)
  serialBatch       String?
  kcs               Boolean   @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("inbound_receipt_items")
}
```

### 3.6 Refactored InboundDocument

```prisma
model InboundDocument {
  id        String   @id @default(uuid())
  receiptId String
  typeId    String
  
  type    InboundDocumentType @relation(fields: [typeId], references: [id])
  receipt InboundReceipt      @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  
  fileName  String
  fileUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("inbound_documents")
}
```

### 3.7 Add Relations to Existing Models

```prisma
// Material - add relation
model Material {
  // ... existing ...
  inboundItems InboundReceiptItem[] @relation("InboundItemMaterial")
}

// MaterialUnit - add relation
model MaterialUnit {
  // ... existing ...
  inboundItems InboundReceiptItem[] @relation("InboundItemUnit")
}

// WarehouseLocation - add relation
model WarehouseLocation {
  // ... existing ...
  inboundItems InboundReceiptItem[] @relation("InboundItemLocation")
}

// Supplier - add relation
model Supplier {
  // ... existing ...
  inboundReceipts InboundReceipt[] @relation("InboundSupplier")
}

// User - add relation
model User {
  // ... existing ...
  createdInboundReceipts InboundReceipt[] @relation("InboundCreator")
}

// PurchaseRequest - add relation
model PurchaseRequest {
  // ... existing ...
  inboundReceipts InboundReceipt[]
}
```

---

## 4. Seed Data

### InboundDocumentType

```typescript
await prisma.inboundDocumentType.createMany({
  data: [
    { code: "INVOICE", name: "Hóa đơn", sortOrder: 1 },
    { code: "DELIVERY_NOTE", name: "Phiếu giao hàng", sortOrder: 2 },
    { code: "PACKING_LIST", name: "Packing List", sortOrder: 3 },
    { code: "COO", name: "Chứng nhận xuất xứ (C/O)", sortOrder: 4 },
    { code: "COA", name: "Chứng nhận chất lượng (COA)", sortOrder: 5 },
    { code: "WARRANTY", name: "Giấy bảo hành", sortOrder: 6 },
    { code: "OTHER", name: "Khác", sortOrder: 99 },
  ],
  skipDuplicates: true
})
```

### InboundType (existing - verify)

```typescript
// Already seeded: PO, REPAIR, LOAN, RETURN
```

### InboundStatus (existing - verify)

```typescript
// Need to seed if not exists
await prisma.inboundStatus.createMany({
  data: [
    { code: "DRAFT", name: "Nháp", color: "bg-gray-100 text-gray-800", sortOrder: 1 },
    { code: "REQUESTED", name: "Yêu cầu nhập", color: "bg-blue-100 text-blue-800", sortOrder: 2 },
    { code: "KCS", name: "Đang KCS", color: "bg-yellow-100 text-yellow-800", sortOrder: 3 },
    { code: "RECEIVING", name: "Đang nhập", color: "bg-orange-100 text-orange-800", sortOrder: 4 },
    { code: "COMPLETED", name: "Hoàn thành", color: "bg-green-100 text-green-800", sortOrder: 5 },
    { code: "CANCELLED", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 6 },
  ],
  skipDuplicates: true
})
```

---

## 5. API Endpoints

### 5.1 Master Data API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/inbound-document-type` | List document types |

### 5.2 Inbound Receipt API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inbound` | List receipts with pagination, filters |
| POST | `/api/inbound` | Create new receipt |
| GET | `/api/inbound/[id]` | Get receipt detail |
| PUT | `/api/inbound/[id]` | Update receipt |
| DELETE | `/api/inbound/[id]` | Delete receipt |
| POST | `/api/inbound/[id]/complete` | Complete receipt → update stock |

### 5.3 Response Format

```typescript
interface InboundReceiptResponse {
  id: string;
  receiptCode: string;
  type: { id: string; code: string; name: string };
  status: { id: string; code: string; name: string; color: string };
  supplier: { id: string; code: string; name: string };
  purchaseRequest?: { id: string; requestCode: string };
  createdBy: { id: string; name: string };
  referenceCode?: string;
  inboundDate: string;
  step: number;
  items: InboundReceiptItemResponse[];
  documents: InboundDocumentResponse[];
}
```

---

## 6. Frontend Components

### File Structure

```
src/app/inbound/
├── page.tsx                    # Server component
├── _components/
│   ├── inbound-client.tsx      # UPDATE - use API
│   ├── inbound-form.tsx        # UPDATE - FK selects
│   ├── inbound-items-table.tsx # UPDATE - material picker
│   ├── inbound-documents.tsx   # UPDATE - document type select
│   └── inbound-stepper.tsx     # Workflow stepper
```

### Key Changes

1. **inbound-form.tsx**
   - Supplier Picker (FK dropdown)
   - PR Picker (optional, để kéo items)
   - InboundType Dropdown
   - Date Picker

2. **inbound-items-table.tsx**
   - Material Picker Dialog (như PR form)
   - Unit Display (từ Material relation)
   - Location Picker (WarehouseLocation dropdown)
   - KCS Checkbox

3. **inbound-documents.tsx**
   - Document Type Dropdown (InboundDocumentType)
   - File Upload
   - File List với delete

---

## 7. Implementation Phases

### Phase 1: Schema & Seed (0.5d)
- [ ] Add `InboundDocumentType` model
- [ ] Add relations to `InboundType`, `InboundStatus`
- [ ] Refactor `InboundReceipt` with FK fields
- [ ] Refactor `InboundReceiptItem` with FK fields
- [ ] Refactor `InboundDocument` with FK field
- [ ] Add reverse relations to existing models
- [ ] Update seed data
- [ ] Run `prisma db push` and `prisma generate`

### Phase 2: API Routes (0.5d)
- [ ] Create/Update `/api/inbound/route.ts` (GET, POST)
- [ ] Create/Update `/api/inbound/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Create `/api/inbound/[id]/complete/route.ts` (stock update logic)
- [ ] Add `/api/master-data/inbound-document-type/route.ts`
- [ ] Test APIs

### Phase 3: Frontend Refactoring (1d)
- [ ] Update `inbound-client.tsx` - API integration
- [ ] Update `inbound-form.tsx` - FK dropdowns
- [ ] Update item table - Material picker, Location picker
- [ ] Update document section - Type dropdown
- [ ] Test full workflow

---

## 8. File Changes Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `prisma/schema.prisma` | UPDATE - Add model + refactor |
| 1 | `prisma/seed.ts` | UPDATE - Add InboundDocumentType |
| 2 | `src/app/api/inbound/route.ts` | UPDATE |
| 2 | `src/app/api/inbound/[id]/route.ts` | UPDATE |
| 2 | `src/app/api/inbound/[id]/complete/route.ts` | NEW |
| 2 | `src/app/api/master-data/inbound-document-type/route.ts` | NEW |
| 3 | `src/app/inbound/_components/inbound-client.tsx` | UPDATE |
| 3 | `src/app/inbound/_components/inbound-form.tsx` | UPDATE |
| 3 | `src/lib/types.ts` | UPDATE - Add types |

---

## 9. Verification Checklist

- [ ] Schema migrations successful
- [ ] Seed data populated (InboundDocumentType, InboundStatus)
- [ ] API endpoints return correct data with nested relations
- [ ] List view displays all columns correctly
- [ ] Create form with Supplier picker works
- [ ] Items table with Material picker works
- [ ] Location picker works
- [ ] Document upload with type selection works
- [ ] Complete flow updates stock correctly
- [ ] Filters work (by type, status)

---

## 10. Assumptions Made

1. **Nguồn (NCC)** = FK to `Supplier`
2. **Tham Chiếu** = Optional FK to `PurchaseRequest` + optional manual `referenceCode`
3. **Items** = Can pull from PR or add manually, FK to `Material`
4. **Vị trí** = FK to `WarehouseLocation`
5. **Loại Hồ sơ** = New master data `InboundDocumentType`
6. **Workflow** = `step` field (1-4, maps to stepper UI)
