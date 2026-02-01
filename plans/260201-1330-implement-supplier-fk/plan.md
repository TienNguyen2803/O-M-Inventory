---
title: "Implement Supplier Feature with FK Relationships"
description: "Refactor Supplier model to use FK for master data, add CRUD contacts, integrate API"
status: completed
priority: P0
effort: 2d
branch: main
---

# Implement Supplier Feature with FK Relationships

**Date**: 2026-02-01
**Type**: Feature Implementation & Database Refactoring
**Status**: Planning

## Overview

Refactor model `Supplier` và `SupplierContact` để:
1. Sử dụng FK relationships thay vì lưu String cho các master data
2. Tích hợp CRUD contacts trong form
3. Implement API routes và seed data

## UI Reference

![Supplier List](file:///C:/Users/tiennm/.gemini/antigravity/brain/44f7166d-777a-4f73-8955-f3f8bf65b65a/uploaded_media_0_1769926931677.png)

![Supplier Detail View](file:///C:/Users/tiennm/.gemini/antigravity/brain/44f7166d-777a-4f73-8955-f3f8bf65b65a/uploaded_media_1_1769926931677.png)

![Supplier Edit Form](file:///C:/Users/tiennm/.gemini/antigravity/brain/44f7166d-777a-4f73-8955-f3f8bf65b65a/uploaded_media_2_1769926931677.png)

![Supplier Contacts Section](file:///C:/Users/tiennm/.gemini/antigravity/brain/44f7166d-777a-4f73-8955-f3f8bf65b65a/uploaded_media_3_1769926931677.png)

---

## Phạm vi thay đổi

### Supplier Model - FK Refactoring

| Field hiện tại | → FK mới | → Relation table |
|----------------|----------|------------------|
| `country: String` | `countryId: String` | `Country` |
| `type: String` | `typeId: String` | `SupplierType` |
| `paymentTerm: String` | `paymentTermId: String` | `PaymentTerm` |
| `currency: String` | `currencyId: String` | `Currency` |
| `status: String` | **GIỮ NGUYÊN** | Enum "Active"/"Inactive" |

### SupplierContact Model - Field Updates

Thêm các field mới nếu cần (giữ nguyên schema hiện tại, chỉ update UI)

---

## Implementation Phases

| # | Phase | Status | Effort | Description |
|---|-------|--------|--------|-------------|
| 1 | Schema Migration | Pending | 30m | Update Prisma schema |
| 2 | Seed Data | Pending | 20m | Add SupplierType data, seed suppliers |
| 3 | API Routes | Pending | 40m | Implement CRUD endpoints |
| 4 | Frontend Update | Pending | 1h | Update types, form, client |
| 5 | Testing | Pending | 30m | Verify all flows |

---

## Phase 1: Schema Migration

### 1.1 Cập nhật Prisma Schema

**File**: `prisma/schema.prisma`

```prisma
// === NHÀ CUNG CẤP Master Data - Thêm relations ===

model SupplierType {
  // ... existing fields ...
  suppliers Supplier[]
}

model PaymentTerm {
  // ... existing fields ...
  suppliers Supplier[]
}

model Currency {
  // ... existing fields ...
  suppliers Supplier[]
}

// Country đã có relation với Material, thêm relation với Supplier

model Country {
  // ... existing fields ...
  materials  Material[]
  suppliers  Supplier[]
}
```

### 1.2 Refactor Supplier Model

```prisma
// BEFORE
model Supplier {
  id          String   @id @default(uuid())
  code        String   @unique
  taxCode     String
  name        String
  address     String
  country     String       // ← String
  type        String       // ← String
  paymentTerm String       // ← String
  currency    String       // ← String
  status      String   @default("Active")
  contacts    SupplierContact[]
}

// AFTER
model Supplier {
  id            String   @id @default(uuid())
  code          String   @unique
  taxCode       String
  name          String
  address       String
  
  // FK Relations to Master Data
  countryId     String
  typeId        String
  paymentTermId String
  currencyId    String
  
  country       Country      @relation(fields: [countryId], references: [id])
  supplierType  SupplierType @relation(fields: [typeId], references: [id])
  paymentTerm   PaymentTerm  @relation(fields: [paymentTermId], references: [id])
  currency      Currency     @relation(fields: [currencyId], references: [id])
  
  status        String   @default("Active")  // Giữ enum string
  contacts      SupplierContact[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("suppliers")
}
```

---

## Phase 2: Seed Data

### 2.1 Bổ sung SupplierType Master Data

**File**: `prisma/seed.ts`

```typescript
// SupplierType - Thêm vào master data seeding
const supplierTypes = [
  { code: 'OEM', name: 'OEM', sortOrder: 1 },
  { code: 'DISTRIBUTOR', name: 'Distributor', sortOrder: 2 },
  { code: 'MANUFACTURER', name: 'Manufacturer', sortOrder: 3 },
  { code: 'AGENT', name: 'Agent', sortOrder: 4 },
];
```

### 2.2 Seed Supplier Data

```typescript
// Get master data IDs first
const countryVN = await prisma.country.findUnique({ where: { code: 'VN' }});
const typeOEM = await prisma.supplierType.findUnique({ where: { code: 'OEM' }});
const paymentNet30 = await prisma.paymentTerm.findUnique({ where: { code: 'NET30' }});
const currencyVND = await prisma.currency.findUnique({ where: { code: 'VND' }});

// Seed suppliers with FK IDs
await prisma.supplier.create({
  data: {
    code: 'NCC-001',
    taxCode: '0101234567',
    name: 'Siemens Energy Vietnam',
    address: 'Deutsches Haus, TP.HCM',
    countryId: countryVN.id,
    typeId: typeOEM.id,
    paymentTermId: paymentNet30.id,
    currencyId: currencyVND.id,
    status: 'Active',
    contacts: {
      create: [
        { name: 'Mr. John', position: 'Sales Mgr', email: 'john@siemens.com', phone: '+84 909 123 456' },
        { name: 'Ms. Anna', position: 'Tech Support', email: 'anna@siemens.com', phone: '+84 918 654 321' },
      ]
    }
  }
});
```

---

## Phase 3: API Routes

### 3.1 File Structure

```
src/app/api/suppliers/
├── route.ts           # GET all, POST create
└── [id]/
    └── route.ts       # GET by id, PUT update, DELETE
```

### 3.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List all suppliers with relations |
| POST | `/api/suppliers` | Create supplier with contacts |
| GET | `/api/suppliers/[id]` | Get supplier detail |
| PUT | `/api/suppliers/[id]` | Update supplier and contacts |
| DELETE | `/api/suppliers/[id]` | Delete supplier (cascade contacts) |

### 3.3 Include Relations

```typescript
const suppliers = await prisma.supplier.findMany({
  include: {
    country: true,
    supplierType: true,
    paymentTerm: true,
    currency: true,
    contacts: true,
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## Phase 4: Frontend Updates

### 4.1 TypeScript Types

**File**: `src/lib/types.ts`

```typescript
export interface Supplier {
  id: string;
  code: string;
  taxCode: string;
  name: string;
  address: string;
  
  // FK IDs
  countryId: string;
  typeId: string;
  paymentTermId: string;
  currencyId: string;
  
  // Nested relations
  country: MasterDataItem;
  supplierType: MasterDataItem;
  paymentTerm: MasterDataItem;
  currency: MasterDataItem;
  
  status: "Active" | "Inactive";
  contacts: ContactPerson[];
}
```

### 4.2 Form Updates

**File**: `src/app/suppliers/_components/supplier-form.tsx`

- Thay đổi Select options từ hardcoded → fetch từ master data API
- Thêm section CRUD cho contacts (Add/Edit/Delete row)
- Submit FK IDs thay vì string values

### 4.3 Client Updates

**File**: `src/app/suppliers/_components/suppliers-client.tsx`

- Integrate với API (useEffect fetch, mutation handlers)
- Display nested data từ relations

---

## Migration Commands

```bash
# 1. Update schema
npx prisma db push --force-reset

# 2. Regenerate client
npx prisma generate

# 3. Seed data
npx prisma db seed

# 4. Verify
npx prisma studio
```

---

## TODO Checklist

### Phase 1: Schema
- [ ] Update `SupplierType` với relation
- [ ] Update `PaymentTerm` với relation
- [ ] Update `Currency` với relation
- [ ] Update `Country` với relation to Supplier
- [ ] Refactor `Supplier` model với FK fields

### Phase 2: Seed
- [ ] Add SupplierType seed data (OEM, Distributor, Manufacturer, Agent)
- [ ] Add Supplier seed data với FK lookup
- [ ] Add SupplierContact seed data

### Phase 3: API
- [ ] Create `/api/suppliers/route.ts` (GET, POST)
- [ ] Create `/api/suppliers/[id]/route.ts` (GET, PUT, DELETE)
- [ ] Test API endpoints

### Phase 4: Frontend
- [ ] Update `Supplier` type in `types.ts`
- [ ] Update `SupplierFormValues` schema
- [ ] Refactor form to use master data Select
- [ ] Add contact CRUD in form
- [ ] Integrate API in `suppliers-client.tsx`

### Phase 5: Testing
- [ ] Run migration
- [ ] Verify seed data in Prisma Studio
- [ ] Test CRUD operations in UI
