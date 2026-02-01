# Database Schema

## Overview

Hệ thống sử dụng PostgreSQL với Prisma 7 ORM. Schema được chia thành 2 nhóm chính:
- **Master Data Tables (25 bảng)**: Dữ liệu tham chiếu, lookup values
- **Business Data Tables**: Dữ liệu nghiệp vụ chính

## Master Data Tables (25 bảng)

Mỗi bảng master data có cấu trúc chuẩn:

```prisma
model [TableName] {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Phân nhóm Master Data

| Nhóm | Bảng | Table Name | Records |
|------|------|------------|---------|
| **VẬT TƯ** | | | |
| | MaterialStatus | `material_statuses` | 5 |
| | MaterialCategory | `material_categories` | 9 |
| | MaterialUnit | `material_units` | 6 |
| | ManagementType | `management_types` | 2 |
| **KHO** | | | |
| | WarehouseArea | `warehouse_areas` | 5 |
| | WarehouseType | `warehouse_types` | 3 |
| | WarehouseStatus | `warehouse_statuses` | 2 |
| **NHÀ CUNG CẤP** | | | |
| | SupplierType | `supplier_types` | 3 |
| | PaymentTerm | `payment_terms` | 4 |
| | Currency | `currencies` | 5 |
| **YÊU CẦU VẬT TƯ** | | | |
| | RequestPriority | `request_priorities` | 2 |
| | RequestStatus | `request_statuses` | 3 |
| **MUA SẮM** | | | |
| | PurchaseSource | `purchase_sources` | 2 |
| | PurchaseStatus | `purchase_statuses` | 4 |
| | MaterialOrigin | `material_origins` | 2 |
| | FundingSource | `funding_sources` | 3 |
| **ĐẤU THẦU** | | | |
| | BiddingMethod | `bidding_methods` | 2 |
| | BiddingStatus | `bidding_statuses` | 5 |
| **NHẬP KHO** | | | |
| | InboundType | `inbound_types` | 4 |
| | InboundStatus | `inbound_statuses` | 4 |
| **XUẤT KHO** | | | |
| | OutboundPurpose | `outbound_purposes` | 4 |
| | OutboundStatus | `outbound_statuses` | 4 |
| **KIỂM KÊ** | | | |
| | StocktakeStatus | `stocktake_statuses` | 3 |
| | StocktakeArea | `stocktake_areas` | 4 |
| **NGƯỜI DÙNG & NHẬT KÝ** | | | |
| | UserStatus | `user_statuses` | 2 |
| | ActivityAction | `activity_actions` | 6 |
| **TỔ CHỨC** | | | |
| | Department | `departments` | 8 |
| **XUẤT XỨ** | | | |
| | Country | `countries` | - |

**Tổng: 27 Master Data Tables**

---

## Business Data Tables

### Material (Vật tư)

```prisma
model Material {
  id             String   @id @default(uuid())
  name           String
  nameEn         String?
  code           String   @unique
  evnCode        String?
  partNo         String
  serialNumber   String?
  
  // FK Relations to Master Data
  managementTypeId String
  categoryId       String
  unitId           String
  statusId         String
  countryId        String?
  
  managementType   ManagementType   @relation(fields: [managementTypeId], references: [id])
  materialCategory MaterialCategory @relation(fields: [categoryId], references: [id])
  materialUnit     MaterialUnit     @relation(fields: [unitId], references: [id])
  materialStatus   MaterialStatus   @relation(fields: [statusId], references: [id])
  country          Country?         @relation(fields: [countryId], references: [id])
  
  description    String?
  stock          Int      @default(0)
  manufacturer   String?
  minStock       Int?
  maxStock       Int?
  technicalSpecs Json?
  location       String?
  // ... additional fields
}
```

> **Note**: Material model đã được refactor để sử dụng FK relations thay vì string columns:
> - `managementTypeId` → FK to `ManagementType`
> - `categoryId` → FK to `MaterialCategory`  
> - `unitId` → FK to `MaterialUnit`
> - `statusId` → FK to `MaterialStatus`
> - `countryId` → FK to `Country` (xuất xứ)
> - Removed: `managementType`, `category`, `unit`, `status`, `origin` string columns

### Country (Xuất xứ)

```prisma
model Country {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  color     String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  materials Material[]

  @@map("countries")
}
```

### Supplier (Nhà cung cấp)

```prisma
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

  status        String   @default("Active")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  contacts SupplierContact[]

  @@map("suppliers")
}
```

> **Note**: Supplier model đã được refactor để sử dụng FK relations thay vì string columns:
> - `countryId` → FK to `Country`
> - `typeId` → FK to `SupplierType`
> - `paymentTermId` → FK to `PaymentTerm`
> - `currencyId` → FK to `Currency`
> - Removed: `country`, `type`, `paymentTerm`, `currency` string columns

### SupplierContact (Liên hệ nhà cung cấp)

```prisma
model SupplierContact {
  id         String   @id @default(uuid())
  supplierId String
  name       String
  position   String
  email      String
  phone      String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  supplier Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  @@map("supplier_contacts")
}
```

> **Note**: SupplierContact sử dụng `onDelete: Cascade` - khi xóa Supplier, tất cả contacts sẽ tự động bị xóa.

### Warehouse Location (Vị trí kho)

```prisma
model WarehouseLocation {
  id         String   @id @default(uuid())
  code       String   @unique
  name       String

  // FK Relations to Master Data
  areaId     String
  typeId     String
  statusId   String

  warehouseArea   WarehouseArea   @relation(fields: [areaId], references: [id])
  warehouseType   WarehouseType   @relation(fields: [typeId], references: [id])
  warehouseStatus WarehouseStatus @relation(fields: [statusId], references: [id])

  barcode    String?
  maxWeight  Float?
  dimensions String?
  items      WarehouseItem[]
}
```

> **Note**: WarehouseLocation model has been refactored to use FK relations:
> - `areaId` -> FK to `WarehouseArea`
> - `typeId` -> FK to `WarehouseType`
> - `statusId` -> FK to `WarehouseStatus`
> - Removed: `area`, `type`, `status` string columns

### Material Request (Yêu cầu vật tư)

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

> **Note**: MaterialRequest model đã được refactor để sử dụng FK relations:
> - `requesterId` → FK to `User` (người yêu cầu)
> - `departmentId` → FK to `Department`
> - `priorityId` → FK to `RequestPriority`
> - `statusId` → FK to `RequestStatus`
> - `approverId` → FK to `User` (người duyệt, optional)
> - Removed: `requesterName`, `requesterDept`, `priority`, `status`, `approver` string columns

### Material Request Item (Chi tiết yêu cầu vật tư)

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

> **Note**: MaterialRequestItem sử dụng `onDelete: Cascade` - khi xóa MaterialRequest, tất cả items sẽ tự động bị xóa.

### Purchase Request (Yêu cầu mua sắm)

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

  requester     User            @relation("PurchaseRequester", fields: [requesterId], references: [id])
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

> **Note**: PurchaseRequest model đã được refactor để sử dụng FK relations:
> - `requesterId` → FK to `User`
> - `departmentId` → FK to `Department`
> - `statusId` → FK to `RequestStatus`
> - `sourceId` → FK to `MaterialOrigin`
> - `fundingSourceId` → FK to `FundingSource`
> - Removed: `requesterName`, `requesterDept`, `source`, `fundingSource`, `status` string columns

### Purchase Request Item (Chi tiết yêu cầu mua sắm)

```prisma
model PurchaseRequestItem {
  id                  String   @id @default(uuid())
  requestId           String
  materialId          String?
  name                String
  unitId              String
  quantity            Int
  estimatedPrice      Float
  suggestedSupplierId String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  request           PurchaseRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  material          Material?       @relation(fields: [materialId], references: [id])
  unit              MaterialUnit    @relation(fields: [unitId], references: [id])
  suggestedSupplier Supplier?       @relation(fields: [suggestedSupplierId], references: [id])

  @@map("purchase_request_items")
}
```

> **Note**: PurchaseRequestItem sử dụng `onDelete: Cascade`. FK relations:
> - `materialId` → Optional FK to `Material`
> - `unitId` → FK to `MaterialUnit`
> - `suggestedSupplierId` → Optional FK to `Supplier`

### Bidding Package (Gói thầu)

```prisma
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

  // Relations
  purchaseRequests  BiddingPurchaseRequest[]
  participants      BiddingParticipant[]
  scopeItems        BiddingScopeItem[]

  @@map("bidding_packages")
}
```

> **Note**: BiddingPackage FK relations:
> - `methodId` → FK to `BiddingMethod`
> - `statusId` → FK to `BiddingStatus`
> - `createdById` → FK to `User`
> - `winnerId` → Optional FK to `Supplier`

### BiddingPurchaseRequest (N:M junction)

```prisma
model BiddingPurchaseRequest {
  id                String   @id @default(uuid())
  biddingPackageId  String
  purchaseRequestId String

  biddingPackage    BiddingPackage   @relation(fields: [biddingPackageId], references: [id], onDelete: Cascade)
  purchaseRequest   PurchaseRequest  @relation(fields: [purchaseRequestId], references: [id])

  @@unique([biddingPackageId, purchaseRequestId])
  @@map("bidding_purchase_requests")
}
```

### BiddingScopeItem (Hạng mục thầu)

```prisma
model BiddingScopeItem {
  id                String   @id @default(uuid())
  biddingPackageId  String
  materialId        String?
  name              String
  unitId            String
  quantity          Float
  estimatedAmount   Float

  biddingPackage    BiddingPackage @relation(fields: [biddingPackageId], references: [id], onDelete: Cascade)
  material          Material?      @relation(fields: [materialId], references: [id])
  unit              MaterialUnit   @relation(fields: [unitId], references: [id])
  quotations        BidQuotation[]

  @@map("bidding_scope_items")
}
```

### BiddingParticipant (Nhà thầu tham gia)

```prisma
model BiddingParticipant {
  id                String   @id @default(uuid())
  biddingPackageId  String
  supplierId        String

  biddingPackage    BiddingPackage @relation(fields: [biddingPackageId], references: [id], onDelete: Cascade)
  supplier          Supplier       @relation(fields: [supplierId], references: [id])

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
```

### BidQuotation (Báo giá từng hạng mục)

```prisma
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

  @@unique([participantId, scopeItemId])
  @@map("bid_quotations")
}
```

### Inbound Receipt (Phiếu nhập kho)

```prisma
model InboundReceipt {
  id          String   @id @default(uuid())
  receiptCode String   @unique
  inboundType String   // Note: String column, not FK
  reference   String
  inboundDate DateTime
  partner     String   // Note: String column, not FK
  status      String   // Note: String column, not FK
  step        Int      @default(1)
  items       InboundReceiptItem[]
  documents   InboundDocument[]
}
```

> **Note**: InboundReceipt sử dụng string columns (`inboundType`, `partner`, `status`) thay vì FK relations. Cần refactor trong tương lai.

### InboundReceiptItem (Chi tiết phiếu nhập)

```prisma
model InboundReceiptItem {
  id              String   @id @default(uuid())
  receiptId       String
  materialId      String?
  materialCode    String
  materialName    String
  unit            String
  quantity        Float
  unitPrice       Float
  totalPrice      Float
  notes           String?

  receipt         InboundReceipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
}
```

### InboundDocument (Chứng từ đính kèm)

```prisma
model InboundDocument {
  id              String   @id @default(uuid())
  receiptId       String
  name            String
  url             String
  uploadedAt      DateTime @default(now())

  receipt         InboundReceipt @relation(fields: [receiptId], references: [id], onDelete: Cascade)
}
```

### Outbound Voucher (Phiếu xuất kho)

```prisma
model OutboundVoucher {
  id                String   @id @default(uuid())
  voucherCode       String   @unique
  purpose           String   // Note: String column, not FK
  materialRequestId String
  department        String   // Note: String column, not FK
  receiverName      String
  reason            String
  status            String   // Note: String column, not FK
  step              Int      @default(1)
  issueDate         DateTime
  items             OutboundVoucherItem[]
}
```

> **Note**: OutboundVoucher sử dụng string columns thay vì FK relations. Cần refactor trong tương lai.

### OutboundVoucherItem (Chi tiết phiếu xuất)

```prisma
model OutboundVoucherItem {
  id              String   @id @default(uuid())
  voucherId       String
  materialId      String?
  materialCode    String
  materialName    String
  unit            String
  quantity        Float
  notes           String?

  voucher         OutboundVoucher @relation(fields: [voucherId], references: [id], onDelete: Cascade)
}
```

### Stock Take (Kiểm kê)

```prisma
model StockTake {
  id        String   @id @default(uuid())
  takeCode  String   @unique
  name      String
  date      DateTime
  status    String   // Note: String column, not FK
  area      String   // Note: String column, not FK
  leader    String
  results   StockTakeResult[]
}
```

> **Note**: StockTake sử dụng string columns thay vì FK relations. Cần refactor trong tương lai.

### StockTakeResult (Kết quả kiểm kê)

```prisma
model StockTakeResult {
  id              String   @id @default(uuid())
  stockTakeId     String
  materialId      String?
  materialCode    String
  materialName    String
  systemQty       Float
  actualQty       Float
  variance        Float
  notes           String?

  stockTake       StockTake @relation(fields: [stockTakeId], references: [id], onDelete: Cascade)
}
```

### User (Người dùng)

```prisma
model User {
  id           String   @id @default(uuid())
  employeeCode String   @unique
  name         String
  email        String   @unique
  phone        String?
  departmentId String
  statusId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  department   Department @relation(fields: [departmentId], references: [id])
  userStatus   UserStatus @relation(fields: [statusId], references: [id])
  userRoles    UserRole[]

  @@map("users")
}
```

> **Note**: User model đã được refactor để sử dụng FK relations thay vì string columns:
> - `departmentId` → FK to `Department`
> - `statusId` → FK to `UserStatus`
> - Removed: `department`, `role`, `status` string columns

### Role (Vai trò)

```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  userCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userRoles          UserRole[]
  roleFeatureActions RoleFeatureAction[]
}
```

### UserRole (Gán User vào Role - Many-to-Many)

```prisma
model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
  @@map("user_roles")
}
```

### Action (Hành động)

```prisma
model Action {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  featureActions FeatureAction[]
}
```

**Actions mặc định**: view (Xem), create (Tạo), edit (Sửa), delete (Xóa), approve (Duyệt)

### Feature (Tính năng)

```prisma
model Feature {
  id        String   @id @default(uuid())
  code      String   @unique
  name      String
  groupCode String
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  featureActions FeatureAction[]
}
```

**Feature Groups**:
- BÁO CÁO & PHÂN TÍCH: dashboard, reports, slow-moving, stock-level
- KẾ HOẠCH & MUA SẮM: material-request, purchase-request, bidding
- NHẬP XUẤT KHO: inbound, outbound, stock-take
- DANH MỤC: materials, suppliers, warehouses
- HỆ THỐNG: users, roles, settings

### FeatureAction (Mapping)

```prisma
model FeatureAction {
  id        String   @id @default(uuid())
  featureId String
  actionId  String
  feature   Feature  @relation(fields: [featureId], references: [id], onDelete: Cascade)
  action    Action   @relation(fields: [actionId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  roleFeatureActions RoleFeatureAction[]

  @@unique([featureId, actionId])
}
```

### RoleFeatureAction (Gán quyền cho Role - Normalized)

```prisma
model RoleFeatureAction {
  id              String        @id @default(uuid())
  roleId          String
  featureActionId String
  createdAt       DateTime      @default(now())

  role          Role          @relation(fields: [roleId], references: [id], onDelete: Cascade)
  featureAction FeatureAction @relation(fields: [featureActionId], references: [id], onDelete: Cascade)

  @@unique([roleId, featureActionId])
  @@index([roleId])
  @@index([featureActionId])
  @@map("role_feature_actions")
}
```

> **Note**: RoleFeatureAction thay thế JSON `permissions` field trong Role model.
> Cho phép normalized many-to-many relationship giữa Role và FeatureAction.

---

## Database Commands

```bash
# Sync schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed master data
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Reset database (caution: deletes all data)
npx prisma db push --force-reset
```
