# Database Schema

## Overview

Hệ thống sử dụng PostgreSQL với Prisma 7 ORM. Schema được chia thành 2 nhóm chính:
- **Master Data Tables (24 bảng)**: Dữ liệu tham chiếu, lookup values
- **Business Data Tables**: Dữ liệu nghiệp vụ chính

## Master Data Tables (24 bảng)

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

**Tổng: 93 master data records**

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
  managementType String   // Batch | Serial
  category       String
  unit           String
  status         String
  description    String?
  stock          Int      @default(0)
  manufacturer   String?
  origin         String?
  minStock       Int?
  maxStock       Int?
  technicalSpecs Json?
  location       String?
  // ... additional fields
}
```

### Supplier (Nhà cung cấp)

```prisma
model Supplier {
  id          String   @id @default(uuid())
  code        String   @unique
  taxCode     String
  name        String
  address     String
  country     String
  type        String
  paymentTerm String
  currency    String
  status      String   @default("Active")
  contacts    SupplierContact[]
}
```

### Warehouse Location (Vị trí kho)

```prisma
model WarehouseLocation {
  id         String   @id @default(uuid())
  code       String   @unique
  name       String
  area       String
  type       String
  status     String   @default("Active")
  barcode    String?
  maxWeight  Float?
  dimensions String?
  items      WarehouseItem[]
}
```

### Material Request (Yêu cầu vật tư)

```prisma
model MaterialRequest {
  id            String   @id @default(uuid())
  requestCode   String   @unique
  requesterName String
  requesterDept String
  reason        String
  requestDate   DateTime
  workOrder     String?
  priority      String
  status        String
  approver      String?
  step          Int      @default(1)
  items         MaterialRequestItem[]
}
```

### Purchase Request (Yêu cầu mua sắm)

```prisma
model PurchaseRequest {
  id            String   @id @default(uuid())
  requestCode   String   @unique
  requesterName String
  requesterDept String
  description   String
  source        String
  fundingSource String
  totalAmount   Float
  status        String
  step          Int?
  items         PurchaseRequestItem[]
}
```

### Inbound Receipt (Phiếu nhập kho)

```prisma
model InboundReceipt {
  id          String   @id @default(uuid())
  receiptCode String   @unique
  inboundType String
  reference   String
  inboundDate DateTime
  partner     String
  status      String
  step        Int      @default(1)
  items       InboundReceiptItem[]
  documents   InboundDocument[]
}
```

### Outbound Voucher (Phiếu xuất kho)

```prisma
model OutboundVoucher {
  id                String   @id @default(uuid())
  voucherCode       String   @unique
  purpose           String
  materialRequestId String
  department        String
  receiverName      String
  reason            String
  status            String
  step              Int      @default(1)
  issueDate         DateTime
  items             OutboundVoucherItem[]
}
```

### Stock Take (Kiểm kê)

```prisma
model StockTake {
  id        String   @id @default(uuid())
  takeCode  String   @unique
  name      String
  date      DateTime
  status    String
  area      String
  leader    String
  results   StockTakeResult[]
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
  department   String
  role         String
  status       String   @default("Active")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Role (Vai trò)

```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  userCount   Int      @default(0)
  permissions Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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

  @@unique([featureId, actionId])
}
```

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
