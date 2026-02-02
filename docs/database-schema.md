# Database Schema

## Overview

PostgreSQL with Prisma 7 ORM. Schema organized into:
- **Master Data Tables (28 tables)**: Lookup/reference data
- **Business Data Tables**: Core business entities
- **Lifecycle Tracking**: Material lifecycle events and installations

## Master Data Tables (28 tables)

Standard structure for all master data:

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

### Master Data by Category

| Category | Table | DB Name |
|----------|-------|---------|
| **VAT TU** | MaterialStatus | `material_statuses` |
| | MaterialCategory | `material_categories` |
| | MaterialUnit | `material_units` |
| | ManagementType | `management_types` |
| **KHO** | WarehouseArea | `warehouse_areas` |
| | WarehouseType | `warehouse_types` |
| | WarehouseStatus | `warehouse_statuses` |
| **NHA CUNG CAP** | SupplierType | `supplier_types` |
| | PaymentTerm | `payment_terms` |
| | Currency | `currencies` |
| **XUAT XU** | Country | `countries` |
| **YEU CAU VT** | RequestPriority | `request_priorities` |
| | RequestStatus | `request_statuses` |
| **MUA SAM** | PurchaseSource | `purchase_sources` |
| | PurchaseStatus | `purchase_statuses` |
| | MaterialOrigin | `material_origins` |
| | FundingSource | `funding_sources` |
| **DAU THAU** | BiddingMethod | `bidding_methods` |
| | BiddingStatus | `bidding_statuses` |
| **NHAP KHO** | InboundType | `inbound_types` |
| | InboundStatus | `inbound_statuses` |
| | InboundDocumentType | `inbound_document_types` |
| **XUAT KHO** | OutboundPurpose | `outbound_purposes` |
| | OutboundStatus | `outbound_statuses` |
| **KIEM KE** | StocktakeStatus | `stocktake_statuses` |
| | StocktakeArea | `stocktake_areas` |
| | StocktakeAssignmentStatus | `stocktake_assignment_statuses` |
| **USER/LOG** | UserStatus | `user_statuses` |
| | ActivityAction | `activity_actions` |
| **TO CHUC** | Department | `departments` |

---

## Business Data Tables

### Material

```prisma
model Material {
  id               String   @id @default(uuid())
  name             String
  nameEn           String?
  code             String   @unique
  evnCode          String?
  partNo           String
  serialNumber     String?

  // FK Relations
  managementTypeId String
  categoryId       String
  unitId           String
  statusId         String
  countryId        String?

  description      String?
  stock            Int      @default(0)
  manufacturer     String?
  minStock         Int?
  maxStock         Int?
  technicalSpecs   Json?
  // Additional: location, stockAge, warranty fields, lifespan

  // Lifecycle relations
  lifecycleEvents  MaterialEvent[]
  installations    Installation[]

  @@index([serialNumber])
  @@map("materials")
}
```

### Supplier

```prisma
model Supplier {
  id            String   @id @default(uuid())
  code          String   @unique
  taxCode       String
  name          String
  address       String

  // FK Relations
  countryId     String
  typeId        String
  paymentTermId String
  currencyId    String

  status        String   @default("Active")
  contacts      SupplierContact[]

  @@map("suppliers")
}
```

### WarehouseLocation

```prisma
model WarehouseLocation {
  id         String   @id @default(uuid())
  code       String   @unique
  name       String
  areaId     String   // FK to WarehouseArea
  typeId     String   // FK to WarehouseType
  statusId   String   // FK to WarehouseStatus
  barcode    String?
  maxWeight  Float?
  dimensions String?

  items               WarehouseItem[]
  inboundItems        InboundReceiptItem[]
  outboundItems       OutboundReceiptItem[]
  stocktakeAssignments StocktakeAssignment[]
  stocktakeResults    StocktakeResult[]

  @@map("warehouse_locations")
}
```

### MaterialRequest

```prisma
model MaterialRequest {
  id           String   @id @default(uuid())
  requestCode  String   @unique   // MR-YYYY-XXX

  // FK Relations
  requesterId  String   // FK to User
  departmentId String   // FK to Department
  priorityId   String   // FK to RequestPriority
  statusId     String   // FK to RequestStatus
  approverId   String?  // FK to User (optional)

  reason       String
  requestDate  DateTime
  workOrder    String?
  step         Int      @default(1)

  items            MaterialRequestItem[]
  outboundReceipts OutboundReceipt[]

  @@map("material_requests")
}
```

### PurchaseRequest

```prisma
model PurchaseRequest {
  id              String   @id @default(uuid())
  requestCode     String   @unique   // PR-YYYY-XXX

  // FK Relations
  requesterId     String
  departmentId    String
  statusId        String
  sourceId        String   // FK to MaterialOrigin
  fundingSourceId String   // FK to FundingSource

  description     String
  totalAmount     Float
  step            Int?

  items           PurchaseRequestItem[]
  biddingPackages BiddingPurchaseRequest[]
  inboundReceipts InboundReceipt[]

  @@map("purchase_requests")
}
```

### BiddingPackage

```prisma
model BiddingPackage {
  id              String   @id @default(uuid())
  packageCode     String   @unique  // TB-YYYY-XX
  name            String

  // FK Relations
  methodId        String   // FK to BiddingMethod
  statusId        String   // FK to BiddingStatus
  createdById     String   // FK to User
  winnerId        String?  // FK to Supplier (winner)

  estimatedBudget Float
  openDate        DateTime
  closeDate       DateTime
  step            Int      @default(1)  // 1-4 stepper
  notes           String?

  purchaseRequests BiddingPurchaseRequest[]
  participants     BiddingParticipant[]
  scopeItems       BiddingScopeItem[]

  @@map("bidding_packages")
}
```

### InboundReceipt

```prisma
model InboundReceipt {
  id                String   @id @default(uuid())
  receiptCode       String   @unique  // PNK-YYYY-XXX

  // FK Relations
  typeId            String   // FK to InboundType
  statusId          String   // FK to InboundStatus
  supplierId        String   // FK to Supplier
  purchaseRequestId String?  // Optional FK to PurchaseRequest
  createdById       String   // FK to User

  referenceCode     String?  // Manual reference (if no PR)
  inboundDate       DateTime
  notes             String?
  step              Int      @default(1)

  items     InboundReceiptItem[]
  documents InboundDocument[]

  @@map("inbound_receipts")
}
```

### InboundReceiptItem

```prisma
model InboundReceiptItem {
  id                String   @id @default(uuid())
  receiptId         String

  // FK Relations
  materialId        String   // FK to Material
  unitId            String   // FK to MaterialUnit
  locationId        String?  // FK to WarehouseLocation (assign when receiving)

  orderedQuantity   Int
  receivedQuantity  Int      @default(0)
  receivingQuantity Int      @default(0)
  serialBatch       String?
  kcs               Boolean  @default(false)

  // KCS Inspection
  kcsDate           DateTime?
  kcsInspectorId    String?   // FK to User
  kcsResult         String?

  @@index([kcsInspectorId])
  @@map("inbound_receipt_items")
}
```

### OutboundReceipt

```prisma
model OutboundReceipt {
  id                String   @id @default(uuid())
  receiptCode       String   @unique  // PXK-YYYY-XXX

  // FK Relations
  purposeId         String   // FK to OutboundPurpose
  statusId          String   // FK to OutboundStatus
  receiverId        String   // FK to User (recipient)
  materialRequestId String?  // Optional FK to MaterialRequest
  createdById       String   // FK to User
  approverId        String?  // FK to User (approver)

  reason            String?
  outboundDate      DateTime
  approvedAt        DateTime?
  issuedAt          DateTime?
  notes             String?
  step              Int      @default(1)

  items OutboundReceiptItem[]

  @@map("outbound_receipts")
}
```

### OutboundReceiptItem

```prisma
model OutboundReceiptItem {
  id                String   @id @default(uuid())
  receiptId         String

  // FK Relations
  materialId        String   // FK to Material
  unitId            String   // FK to MaterialUnit
  locationId        String?  // FK to WarehouseLocation (picking location)

  requestedQuantity Int
  issuedQuantity    Int      @default(0)
  serialBatch       String?

  @@map("outbound_receipt_items")
}
```

### Stocktake

```prisma
model Stocktake {
  id           String   @id @default(uuid())
  takeCode     String   @unique  // KK-YYYY-XXX
  name         String

  // FK Relations
  statusId     String   // FK to StocktakeStatus
  areaId       String   // FK to StocktakeArea
  createdById  String   // FK to User

  takeDate     DateTime
  notes        String?
  completedAt  DateTime?

  assignments  StocktakeAssignment[]
  results      StocktakeResult[]

  @@map("stocktakes")
}
```

### StocktakeAssignment

```prisma
model StocktakeAssignment {
  id           String   @id @default(uuid())
  stocktakeId  String
  locationId   String   // FK to WarehouseLocation
  assigneeId   String   // FK to User
  statusId     String   // FK to StocktakeAssignmentStatus

  completedAt  DateTime?

  @@unique([stocktakeId, locationId])
  @@map("stocktake_assignments")
}
```

### StocktakeResult

```prisma
model StocktakeResult {
  id             String   @id @default(uuid())
  stocktakeId    String

  // FK Relations
  materialId     String   // FK to Material
  locationId     String   // FK to WarehouseLocation
  unitId         String   // FK to MaterialUnit
  countedById    String   // FK to User

  bookQuantity   Int
  actualQuantity Int
  variance       Int      // actual - book
  serialBatch    String?
  notes          String?

  @@unique([stocktakeId, materialId, locationId])
  @@map("stocktake_results")
}
```

---

## Lifecycle Tracking

### MaterialEventType (Enum)

```prisma
enum MaterialEventType {
  REQUEST
  APPROVED
  PO_ISSUED   // Future
  INBOUND
  QC
  OUTBOUND
  INSTALLED
}
```

### MaterialEvent

```prisma
model MaterialEvent {
  id            String   @id @default(uuid())
  materialId    String   // FK to Material
  eventType     MaterialEventType
  eventDate     DateTime

  // Actor
  actorId       String   // FK to User
  actorName     String   // Denormalized for display

  // Reference document
  referenceType String   // "MaterialRequest", "InboundReceipt", etc.
  referenceId   String
  referenceCode String

  description   String
  metadata      Json?

  @@index([materialId, eventDate])
  @@index([referenceType, referenceId])
  @@map("material_events")
}
```

### Installation

```prisma
model Installation {
  id            String   @id @default(uuid())
  materialId    String   // FK to Material
  installedById String   // FK to User

  locationName  String   // Physical installation location
  slotInfo      String?
  installedAt   DateTime
  notes         String?

  @@index([materialId])
  @@index([installedById])
  @@map("installations")
}
```

---

## System Tables

### User

```prisma
model User {
  id           String   @id @default(uuid())
  employeeCode String   @unique
  name         String
  email        String   @unique
  phone        String?
  departmentId String   // FK to Department
  statusId     String   // FK to UserStatus

  userRoles    UserRole[]

  // Relations to business entities
  requestedMaterialRequests MaterialRequest[]
  approvedMaterialRequests  MaterialRequest[]
  purchaseRequests          PurchaseRequest[]
  createdBiddingPackages    BiddingPackage[]
  createdInboundReceipts    InboundReceipt[]
  receivedOutboundReceipts  OutboundReceipt[]
  createdOutboundReceipts   OutboundReceipt[]
  approvedOutboundReceipts  OutboundReceipt[]
  createdStocktakes         Stocktake[]
  stocktakeAssignments      StocktakeAssignment[]
  stocktakeResults          StocktakeResult[]
  performedInstallations    Installation[]
  kcsInspections            InboundReceiptItem[]
  materialEvents            MaterialEvent[]

  @@map("users")
}
```

### Permission Models

```prisma
model Role { id, name, description, userCount, userRoles[], roleFeatureActions[] }
model UserRole { id, userId, roleId @@unique([userId, roleId]) }
model Action { id, code, name, sortOrder, isActive, featureActions[] }
model Feature { id, code, name, groupCode, sortOrder, isActive, featureActions[] }
model FeatureAction { id, featureId, actionId @@unique([featureId, actionId]) }
model RoleFeatureAction { id, roleId, featureActionId @@unique([roleId, featureActionId]) }
```

### Logging

```prisma
model ActivityLog {
  id         String   @id @default(uuid())
  timestamp  DateTime @default(now())
  userName   String
  userAvatar String?
  action     String
  targetType String
  targetId   String
  details    String
  @@index([timestamp])
  @@map("activity_logs")
}

model InventoryLog {
  id           String   @id @default(uuid())
  materialId   String
  materialName String
  quantity     Int
  type         String   // "inbound" | "outbound"
  date         DateTime
  actor        String
  @@index([date])
  @@map("inventory_logs")
}
```

---

## Database Commands

```bash
# Sync schema
npx prisma db push

# Generate client
npx prisma generate

# Seed data
npx prisma db seed

# Open Studio
npx prisma studio

# Reset (CAUTION)
npx prisma db push --force-reset
```
