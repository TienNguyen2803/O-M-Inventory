---
title: "Implement Bidding Management Feature with FK Relationships"
description: "Full CRUD for BiddingPackage with N:M PR relations, bidder tracking, quotations, winner selection"
status: completed
priority: P0
effort: 3d
branch: main
tags: [bidding, procurement, transactional]
created: 2026-02-01
---

# Bidding Management (Quản lý Đấu thầu) Implementation Plan

## 1. Mục tiêu

Implement đầy đủ feature **Quản lý Đấu thầu** bao gồm:
- CRUD cho `BiddingPackage` (Gói thầu)
- N:M relationship với `PurchaseRequest`
- Tracking nhiều nhà thầu tham gia dự thầu (`BiddingParticipant`)
- Lưu báo giá/đề xuất từng nhà thầu (`BidQuotation`)
- Chọn nhà thầu trúng thầu khi chấm thầu
- Tất cả FK với master data, không lưu String

## 2. Business Requirements (From UI Analysis)

### 2.1 List View Columns
| Column | Description |
|--------|-------------|
| Mã gói | Package code (auto-generated: TB-YYYY-XX) |
| Tên gói thầu | Package name |
| Căn cứ PR | Linked Purchase Request(s) |
| Giá dự toán | Estimated budget |
| Hình thức | Bidding method (FK) |
| Trạng thái | Status (FK) |

### 2.2 Form Fields (Create/Edit)
| Field | Type | Required |
|-------|------|----------|
| Tên gói thầu | Text | ✓ |
| Mã gói | Auto-generated | ✓ |
| Căn cứ PR | Multi-select PR | ✓ |
| Hình thức | Select (BiddingMethod) | ✓ |
| Giá dự toán | Number | ✓ |
| Ngày mở thầu | DateTime | ✓ |
| Ngày đóng thầu | DateTime | ✓ |

### 2.3 Workflow Stepper
1. **Mời thầu** - Tạo gói, mời nhà thầu
2. **Mở thầu** - Nhà thầu nộp hồ sơ dự thầu
3. **Chấm thầu** - Đánh giá và chọn nhà thầu trúng
4. **Hoàn thành** - Ký hợp đồng

### 2.4 Phạm vi cung cấp (Scope)
- Lấy từ items của các PR liên kết
- Hiển thị: Hạng mục, ĐVT, Khối lượng, Thành tiền
- FK với Material

---

## 3. Database Schema

### 3.1 New Models

```prisma
// === BIDDING PACKAGE ===
model BiddingPackage {
  id                String   @id @default(uuid())
  packageCode       String   @unique  // TB-2026-01
  name              String
  
  // FK Relations
  methodId          String
  statusId          String
  createdById       String
  winnerId          String?  // Nhà thầu trúng thầu
  
  method            BiddingMethod  @relation(fields: [methodId], references: [id])
  status            BiddingStatus  @relation(fields: [statusId], references: [id])
  createdBy         User           @relation("BiddingCreator", fields: [createdById], references: [id])
  winner            Supplier?      @relation("BiddingWinner", fields: [winnerId], references: [id])
  
  estimatedBudget   Float
  openDate          DateTime
  closeDate         DateTime
  step              Int      @default(1)  // 1-4 for stepper
  notes             String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  purchaseRequests  BiddingPurchaseRequest[]
  participants      BiddingParticipant[]
  scopeItems        BiddingScopeItem[]

  @@map("bidding_packages")
}

// === N:M with Purchase Request ===
model BiddingPurchaseRequest {
  id                String   @id @default(uuid())
  biddingPackageId  String
  purchaseRequestId String
  
  biddingPackage    BiddingPackage   @relation(fields: [biddingPackageId], references: [id], onDelete: Cascade)
  purchaseRequest   PurchaseRequest  @relation(fields: [purchaseRequestId], references: [id])
  
  createdAt         DateTime @default(now())

  @@unique([biddingPackageId, purchaseRequestId])
  @@map("bidding_purchase_requests")
}

// === Scope Items (từ PR items) ===
model BiddingScopeItem {
  id                String   @id @default(uuid())
  biddingPackageId  String
  materialId        String?
  name              String   // Tên hạng mục
  unitId            String
  quantity          Float
  estimatedAmount   Float
  
  biddingPackage    BiddingPackage @relation(fields: [biddingPackageId], references: [id], onDelete: Cascade)
  material          Material?      @relation("BiddingScopeMaterial", fields: [materialId], references: [id])
  unit              MaterialUnit   @relation("BiddingScopeUnit", fields: [unitId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("bidding_scope_items")
}

// === Nhà thầu tham gia ===
model BiddingParticipant {
  id                String   @id @default(uuid())
  biddingPackageId  String
  supplierId        String
  
  biddingPackage    BiddingPackage @relation(fields: [biddingPackageId], references: [id], onDelete: Cascade)
  supplier          Supplier       @relation("BiddingSupplier", fields: [supplierId], references: [id])
  
  invitedAt         DateTime @default(now())
  submittedAt       DateTime?
  isSubmitted       Boolean  @default(false)
  
  // Scoring
  technicalScore    Float?
  priceScore        Float?
  totalScore        Float?
  rank              Int?
  
  quotations        BidQuotation[]

  @@unique([biddingPackageId, supplierId])
  @@map("bidding_participants")
}

// === Báo giá từng hạng mục của nhà thầu ===
model BidQuotation {
  id                  String   @id @default(uuid())
  participantId       String
  scopeItemId         String
  
  participant         BiddingParticipant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  scopeItem           BiddingScopeItem   @relation(fields: [scopeItemId], references: [id])
  
  unitPrice           Float
  quantity            Float
  totalPrice          Float
  notes               String?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@unique([participantId, scopeItemId])
  @@map("bid_quotations")
}
```

### 3.2 Update Existing Models

```prisma
// BiddingMethod - add relation
model BiddingMethod {
  // ... existing fields ...
  packages BiddingPackage[]
}

// BiddingStatus - add relation  
model BiddingStatus {
  // ... existing fields ...
  packages BiddingPackage[]
}

// User - add relation
model User {
  // ... existing fields ...
  createdBiddingPackages BiddingPackage[] @relation("BiddingCreator")
}

// Supplier - add relations
model Supplier {
  // ... existing fields ...
  biddingParticipations BiddingParticipant[] @relation("BiddingSupplier")
  wonBiddings           BiddingPackage[]     @relation("BiddingWinner")
}

// PurchaseRequest - add relation
model PurchaseRequest {
  // ... existing fields ...
  biddingPackages BiddingPurchaseRequest[]
}

// Material - add relation
model Material {
  // ... existing fields ...
  biddingScopeItems BiddingScopeItem[] @relation("BiddingScopeMaterial")
}

// MaterialUnit - add relation
model MaterialUnit {
  // ... existing fields ...
  biddingScopeItems BiddingScopeItem[] @relation("BiddingScopeUnit")
}

// BiddingScopeItem - add relation for quotations
model BiddingScopeItem {
  // ... existing fields ...
  quotations BidQuotation[]
}
```

---

## 4. Seed Data

### 4.1 BiddingMethod
| Code | Name | Sort |
|------|------|------|
| OPEN | Đấu thầu rộng rãi | 1 |
| LIMITED | Đấu thầu hạn chế | 2 |
| DIRECT | Chỉ định thầu | 3 |
| COMPETITIVE | Chào hàng cạnh tranh | 4 |

### 4.2 BiddingStatus
| Code | Name | Color | Sort |
|------|------|-------|------|
| INVITE | Đang mời thầu | bg-blue-100 text-blue-800 | 1 |
| OPEN | Đã mở thầu | bg-yellow-100 text-yellow-800 | 2 |
| EVAL | Đang chấm thầu | bg-orange-100 text-orange-800 | 3 |
| DONE | Hoàn thành | bg-green-100 text-green-800 | 4 |
| CANCEL | Đã hủy | bg-red-100 text-red-800 | 5 |

---

## 5. API Endpoints

### 5.1 BiddingPackage CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bidding-packages` | List all packages with filters |
| GET | `/api/bidding-packages/[id]` | Get package detail with relations |
| POST | `/api/bidding-packages` | Create new package |
| PUT | `/api/bidding-packages/[id]` | Update package |
| DELETE | `/api/bidding-packages/[id]` | Delete package |

### 5.2 Participants & Quotations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bidding-packages/[id]/participants` | List participants |
| POST | `/api/bidding-packages/[id]/participants` | Invite supplier |
| PUT | `/api/bidding-packages/[id]/participants/[pid]` | Update participant (scores) |
| DELETE | `/api/bidding-packages/[id]/participants/[pid]` | Remove participant |
| POST | `/api/bidding-packages/[id]/quotations` | Submit quotation |
| PUT | `/api/bidding-packages/[id]/select-winner` | Select winner |

### 5.3 Response Shape

```typescript
// GET /api/bidding-packages response
{
  data: BiddingPackage[];
  pagination: { total, page, limit };
}

// BiddingPackage includes
{
  id, packageCode, name, estimatedBudget,
  openDate, closeDate, step,
  method: { id, code, name },
  status: { id, code, name, color },
  createdBy: { id, name },
  winner: { id, name } | null,
  purchaseRequests: [{ 
    purchaseRequest: { id, requestCode, description }
  }],
  participants: [{
    supplier: { id, name },
    isSubmitted, technicalScore, priceScore, totalScore, rank
  }],
  scopeItems: [{
    id, name, quantity, estimatedAmount,
    material: { id, code, name },
    unit: { id, name }
  }]
}
```

---

## 6. Frontend Components

### 6.1 New Files to Create

```
src/app/bidding/
├── page.tsx
├── _components/
│   ├── bidding-client.tsx         # Main list + CRUD
│   ├── bidding-form.tsx           # Create/Edit form
│   ├── bidding-stepper.tsx        # 4-step workflow
│   ├── scope-table.tsx            # Phạm vi cung cấp
│   ├── participant-table.tsx      # Nhà thầu tham gia
│   ├── quotation-form.tsx         # Nhập báo giá
│   └── pr-picker-dialog.tsx       # Multi-select PR
```

### 6.2 TypeScript Types

```typescript
// src/lib/types.ts

export interface BiddingPackage {
  id: string;
  packageCode: string;
  name: string;
  
  methodId: string;
  statusId: string;
  createdById: string;
  winnerId?: string;
  
  method: MasterDataItem;
  status: MasterDataItem & { code: string };
  createdBy: { id: string; name: string };
  winner?: { id: string; name: string };
  
  estimatedBudget: number;
  openDate: string;
  closeDate: string;
  step: number;
  notes?: string;
  
  purchaseRequests: Array<{
    purchaseRequest: {
      id: string;
      requestCode: string;
      description: string;
    };
  }>;
  
  participants: BiddingParticipant[];
  scopeItems: BiddingScopeItem[];
}

export interface BiddingParticipant {
  id: string;
  supplierId: string;
  supplier: { id: string; name: string };
  invitedAt: string;
  submittedAt?: string;
  isSubmitted: boolean;
  technicalScore?: number;
  priceScore?: number;
  totalScore?: number;
  rank?: number;
  quotations: BidQuotation[];
}

export interface BiddingScopeItem {
  id: string;
  materialId?: string;
  name: string;
  unitId: string;
  quantity: number;
  estimatedAmount: number;
  material?: { id: string; code: string; name: string };
  unit: MasterDataItem;
}

export interface BidQuotation {
  id: string;
  participantId: string;
  scopeItemId: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
}
```

---

## 7. Implementation Phases

### Phase 1: Schema & Seed (0.5d) ✅
- [x] Update `prisma/schema.prisma` with new models
- [x] Add relations to existing models
- [x] Update `prisma/seed.ts` with BiddingMethod, BiddingStatus, sample data
- [x] Run `prisma db push` and `prisma generate`
- [x] Run seed and verify in Prisma Studio

### Phase 2: API Routes (0.5d) ✅
- [x] Create `/api/bidding-packages/route.ts` (GET, POST)
- [x] Create `/api/bidding-packages/[id]/route.ts` (GET, PUT, DELETE)
- [x] Create `/api/bidding-packages/[id]/participants/route.ts`
- [x] Create `/api/bidding-packages/[id]/select-winner/route.ts`
- [x] Test APIs with Postman/Thunder Client

### Phase 3: Frontend - List & Basic CRUD (1d) ✅
- [x] Create `src/app/biddings/page.tsx`
- [x] Create `biddings-client.tsx` with list view, filters
- [x] Create `bidding-form.tsx` with create/edit form
- [x] Implement PR picker dialog (multi-select)
- [x] Implement scope table (auto-populate from PR items)
- [x] Add sidebar navigation link

### Phase 4: Frontend - Advanced Features (1d) ✅
- [x] Create `bidding-participants-section.tsx` for managing bidders
- [x] Create `bidding-quotation-dialog.tsx` for quotation entry form
- [x] Implement scoring and ranking
- [x] Implement winner selection
- [x] Create `bidding-workflow-step-actions.tsx` for stepper based on workflow state

---

## 8. File Changes Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `prisma/schema.prisma` | UPDATED - Add 5 new models + relations |
| 1 | `prisma/seed.ts` | UPDATED - Add seed data |
| 2 | `src/app/api/bidding-packages/route.ts` | CREATED |
| 2 | `src/app/api/bidding-packages/[id]/route.ts` | CREATED |
| 2 | `src/app/api/bidding-packages/[id]/participants/route.ts` | CREATED |
| 2 | `src/app/api/bidding-packages/[id]/select-winner/route.ts` | CREATED |
| 3 | `src/app/biddings/page.tsx` | CREATED |
| 3 | `src/app/biddings/_components/biddings-client.tsx` | CREATED |
| 3 | `src/app/biddings/_components/bidding-form.tsx` | CREATED |
| 3 | `src/lib/types.ts` | UPDATED - Add bidding types |
| 4 | `src/app/biddings/_components/bidding-participants-section.tsx` | CREATED |
| 4 | `src/app/biddings/_components/bidding-workflow-step-actions.tsx` | CREATED |
| 4 | `src/app/biddings/_components/bidding-quotation-dialog.tsx` | CREATED |

---

## 9. Dependencies

- `PurchaseRequest` feature phải hoàn thành (đã xong)
- `Supplier` feature phải hoàn thành (đã xong)
- Master data `BiddingMethod`, `BiddingStatus` phải có seed data

---

## 10. Verification Checklist

- [x] Schema migrations successful
- [x] Seed data populated (4 methods, 5 statuses)
- [x] API endpoints return correct data with nested relations
- [x] List view displays all columns correctly
- [x] Create form validates required fields
- [x] Participants can be invited (FK to Supplier)
- [x] Quotations can be entered per participant per scope item
- [x] Scores calculate correctly
- [x] Winner can be selected
- [x] Stepper reflects current workflow state
- [x] Filters work correctly

---

## 11. Screenshots Reference

Based on uploaded UI mockups:
1. **List View**: Columns as defined in section 2.1
2. **Edit Form**: Stepper at top, 2-column layout, scope table below
3. **Create Form**: Similar to edit, empty scope table
