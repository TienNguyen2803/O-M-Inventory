# System Architecture

## Overview

PowerTrack Logistics là hệ thống quản lý vật tư O&M (Operation & Maintenance) cho nhà máy điện, xây dựng trên kiến trúc modern full-stack.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js 15.5 App Router                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │   │
│  │  │   Pages    │  │ Components │  │   API Routes   │  │   │
│  │  │ (17 routes)│  │    (35+)   │  │  (32 routes)   │  │   │
│  │  └────────────┘  └────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Prisma 7 ORM                          │   │
│  │  ┌─────────────────┐  ┌────────────────────────────┐ │   │
│  │  │  @prisma/client │  │  @prisma/adapter-pg        │ │   │
│  │  └─────────────────┘  └────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           PostgreSQL (Docker Container)               │   │
│  │  ┌──────────────────┐  ┌───────────────────────────┐ │   │
│  │  │ 25 Master Tables │  │  Business Data Tables     │ │   │
│  │  └──────────────────┘  └───────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.5.9 |
| Runtime | React | 19.2.1 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.1 |
| UI Library | Radix UI + shadcn/ui | Latest |
| ORM | Prisma | 7.3.0 |
| Database | PostgreSQL | 15+ |
| Database Adapter | @prisma/adapter-pg | 7.3.0 |

## Key Components

### Frontend Pages (17 routes)

| Route | Description |
|-------|-------------|
| `/` | Dashboard |
| `/materials` | Quản lý vật tư |
| `/suppliers` | Quản lý nhà cung cấp |
| `/warehouses` | Quản lý vị trí kho |
| `/material-requests` | Yêu cầu vật tư |
| `/purchase-requests` | Yêu cầu mua sắm |
| `/biddings` | Quản lý đấu thầu |
| `/inbound` | Nhập kho |
| `/outbound` | Xuất kho |
| `/stock-take` | Kiểm kê |
| `/reports` | Báo cáo |
| `/users` | Quản lý người dùng |
| `/roles` | Quản lý vai trò |
| `/settings` | Cài đặt hệ thống |
| `/activity-log` | Nhật ký hoạt động |
| `/lifecycle` | Vòng đời vật tư |
| `/goods-history` | Lịch sử hàng hóa |
| `/profile` | Hồ sơ người dùng |

### Database Layer

- **25 Master Data Tables**: Các bảng lookup data riêng biệt, dễ mở rộng
- **Business Tables**: Materials, Suppliers, Warehouses, Requests, etc.
- **Prisma 7 với PostgreSQL Adapter**: Sử dụng `@prisma/adapter-pg` cho connection pooling

## Data Flow

```
User Action → React Component → API Route → Prisma Client → PostgreSQL
                    ↑                              │
                    └──────── Response ←───────────┘
```

## Architectural Patterns

### Hybrid Implementation Strategy
The system is currently transitioning from a prototype to a fully connected application.

1.  **Fully Connected Modules** (Materials, Requests, Biddings, Suppliers, Warehouses, Auth):
    - Follow standard **Next.js App Router** patterns.
    - **Server Components** for initial data fetch (where possible) or Skeleton loaders.
    - **Client Components** for interactivity (Forms, Tables) fetching data via `fetch` or `SWR` from `/api/*` endpoints.
    - **API Routes** handle business logic and DB interaction via Prisma.

2.  **Partial Modules** (Inbound):
    - UI and API endpoints exist but use string columns instead of FK relations.
    - Backend API available but not fully normalized.

3.  **Prototype Modules** (Outbound, Dashboard):
    - UI Components are built but feed on **Mock Data** (`src/lib/data.ts`).
    - No backend integration yet.
    - *Architecture Goal*: Migrate these to the Connected pattern.

### State Management
- **Server State**: Managed via `React Query` / `SWR` (recommended) or simple `useEffect` fetchers in Client Components.
- **Form State**: `react-hook-form` + `zod` validation.
- **Global State**: Minimal. URL Search Params are used for sharing state (filters, pagination).

## Configuration Files

| File | Purpose |
|------|---------|
| `prisma.config.ts` | Prisma 7 config (datasource, seed command) |
| `prisma/schema.prisma` | Database schema definition |
| `docker-compose.yml` | PostgreSQL container |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `next.config.ts` | Next.js configuration |

---

## API Endpoints

### Master Data API

Generic API cho quản lý 25 bảng master data:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/{tableId}` | Lấy danh sách items |
| POST | `/api/master-data/{tableId}` | Tạo item mới |
| GET | `/api/master-data/{tableId}/{id}` | Lấy 1 item |
| PUT | `/api/master-data/{tableId}/{id}` | Cập nhật item |
| DELETE | `/api/master-data/{tableId}/{id}` | Xóa item (soft delete) |

**tableId** là một trong 25 giá trị:
- Vật tư: `material-status`, `material-category`, `material-unit`, `management-type`
- Kho: `warehouse-area`, `warehouse-type`, `warehouse-status`
- Nhà cung cấp: `supplier-type`, `payment-term`, `currency`
- Yêu cầu vật tư: `request-priority`, `request-status`
- Mua sắm: `purchase-source`, `purchase-status`
- Đấu thầu: `bidding-method`, `bidding-status`
- Nhập kho: `inbound-type`, `inbound-status`
- Xuất kho: `outbound-purpose`, `outbound-status`
- Kiểm kê: `stocktake-status`, `stocktake-area`
- Người dùng & Nhật ký: `user-status`, `activity-action`
- Tổ chức: `department`
- Xuất xứ: `country`

---

## Custom Hooks

| Hook | Usage |
|------|-------|
| `useMasterData(tableId)` | CRUD operations cho master data tables |
| `useUsers()` | CRUD cho users, roles, departments |
| `usePermissions()` | Actions, features, feature-actions, roles management |
| `useMaterialRequests()` | CRUD cho Material Request với FK relations |
| `useToast()` | Toast notifications |
| `useMobile()` | Mobile breakpoint detection |

---

## Warehouse Location API

API cho quản lý vị trí kho với FK relations đến master data:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warehouse-locations` | Danh sách vị trí kho (pagination, search, filter) |
| POST | `/api/warehouse-locations` | Tạo vị trí kho mới |
| GET | `/api/warehouse-locations/{id}` | Chi tiết 1 vị trí kho |
| PUT | `/api/warehouse-locations/{id}` | Cập nhật vị trí kho |
| DELETE | `/api/warehouse-locations/{id}` | Xóa vị trí kho |

### Request Body (POST/PUT)

```json
{
  "code": "A1-01",
  "name": "Kệ A1 Tầng 1",
  "areaId": "uuid",
  "typeId": "uuid",
  "statusId": "uuid",
  "barcode": "WH-A1-01",
  "maxWeight": 500.0,
  "dimensions": "2x1x3m"
}
```

### Response Format (GET list)

```json
{
  "data": [{
    "id": "uuid",
    "code": "A1-01",
    "name": "Kệ A1 Tầng 1",
    "areaId": "area-uuid",
    "typeId": "type-uuid",
    "statusId": "status-uuid",
    "warehouseArea": { "id": "...", "name": "Khu vực A" },
    "warehouseType": { "id": "...", "name": "Kệ thường" },
    "warehouseStatus": { "id": "...", "name": "Đang sử dụng" }
  }],
  "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
}
```

> **Note**: Warehouse Location API uses FK relations. Client sends IDs, API returns nested objects.

---

## Suppliers Management API

API cho quản lý nhà cung cấp với FK relations và contacts management:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | Danh sách nhà cung cấp (với relations) |
| POST | `/api/suppliers` | Tạo nhà cung cấp mới (với contacts) |
| GET | `/api/suppliers/{id}` | Chi tiết 1 nhà cung cấp |
| PUT | `/api/suppliers/{id}` | Cập nhật nhà cung cấp (transactional) |
| DELETE | `/api/suppliers/{id}` | Xóa nhà cung cấp (cascade delete contacts) |

### Request Body (POST/PUT)

```json
{
  "code": "SUP-001",
  "taxCode": "0123456789",
  "name": "ABC Company Ltd",
  "address": "123 Main Street",
  "countryId": "uuid",
  "typeId": "uuid",
  "paymentTermId": "uuid",
  "currencyId": "uuid",
  "status": "Active",
  "contacts": [
    {
      "name": "John Doe",
      "position": "Sales Manager",
      "email": "john@abc.com",
      "phone": "+84 123 456 789"
    }
  ]
}
```

### Response Format (GET list/detail)

```json
{
  "id": "uuid",
  "code": "SUP-001",
  "taxCode": "0123456789",
  "name": "ABC Company Ltd",
  "address": "123 Main Street",
  "countryId": "country-uuid",
  "typeId": "type-uuid",
  "paymentTermId": "term-uuid",
  "currencyId": "currency-uuid",
  "status": "Active",
  "country": { "id": "...", "name": "Vietnam" },
  "supplierType": { "id": "...", "name": "Manufacturer" },
  "paymentTerm": { "id": "...", "name": "Net 30" },
  "currency": { "id": "...", "name": "VND" },
  "contacts": [
    {
      "id": "contact-uuid",
      "name": "John Doe",
      "position": "Sales Manager",
      "email": "john@abc.com",
      "phone": "+84 123 456 789"
    }
  ]
}
```

> **Note**: Suppliers API sử dụng FK relations và nested contacts. PUT operation sử dụng transaction để replace contacts.

---

## Materials Management API

API cho quản lý vật tư với FK relations đến master data:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials` | Danh sách vật tư (pagination, search, filter) |
| POST | `/api/materials` | Tạo vật tư mới |
| GET | `/api/materials/{id}` | Chi tiết 1 vật tư |
| PUT | `/api/materials/{id}` | Cập nhật vật tư |
| DELETE | `/api/materials/{id}` | Xóa vật tư |

### Query Parameters cho GET `/api/materials`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Số trang (mặc định: 1) |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) |
| `search` | string | Tìm theo mã, tên, part number |
| `categoryId` | string | Filter theo ID danh mục (FK) |
| `statusId` | string | Filter theo ID trạng thái (FK) |
| `managementTypeId` | string | Filter theo ID loại quản lý (FK) |

### Response Format (GET list)

```json
{
  "data": [{
    "id": "uuid",
    "code": "PM-TDH-001",
    "name": "Cảm biến áp suất",
    "categoryId": "cat-uuid",
    "statusId": "status-uuid",
    "unitId": "unit-uuid",
    "managementTypeId": "mgmt-uuid",
    "countryId": "country-uuid",
    "materialCategory": { "id": "...", "name": "Phụ tùng TĐH" },
    "materialStatus": { "id": "...", "name": "Mới" },
    "materialUnit": { "id": "...", "name": "Cái" },
    "managementType": { "id": "...", "name": "Serial" },
    "country": { "id": "...", "name": "Nhật Bản" }
  }],
  "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
}
```

> **Note**: Materials API sử dụng FK relations thay vì string values. Client gửi IDs, API trả về nested objects.

---

## User Management API

API cho quản lý người dùng:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Danh sách users (pagination, search, filter) |
| POST | `/api/users` | Tạo user mới |
| GET | `/api/users/{id}` | Chi tiết 1 user |
| PUT | `/api/users/{id}` | Cập nhật user |
| DELETE | `/api/users/{id}` | Xóa user |
| GET | `/api/roles` | Danh sách vai trò |
| GET | `/api/departments` | Danh sách phòng ban |

### Query Parameters cho GET `/api/users`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Số trang (mặc định: 1) |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) |
| `search` | string | Tìm theo mã NV, tên, email |
| `departmentId` | string | Filter theo ID phòng ban (FK) |
| `statusId` | string | Filter theo ID trạng thái (FK) |

> **Note**: API đã được refactor để sử dụng FK IDs thay vì string values.

## Permission Management API

Hệ thống quản lý phân quyền chi tiết với 3 thực thể chính: **Actions**, **Features**, **Roles**.

### Actions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/actions` | Danh sách actions |
| POST | `/api/actions` | Tạo action mới |
| PUT | `/api/actions/{id}` | Cập nhật action |
| DELETE | `/api/actions/{id}` | Xóa action |

**Actions mặc định**: Xem, Tạo, Sửa, Xóa, Duyệt

### Features API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/features` | Danh sách features |
| GET | `/api/features?grouped=true` | Features theo nhóm |
| POST | `/api/features` | Tạo feature mới |
| PUT | `/api/features/{id}` | Cập nhật feature |
| DELETE | `/api/features/{id}` | Xóa feature |

**Feature Groups**: BÁO CÁO & PHÂN TÍCH, KẾ HOẠCH & MUA SẮM, NHẬP XUẤT KHO, DANH MỤC, HỆ THỐNG

### Feature-Actions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feature-actions` | Danh sách mappings |
| POST | `/api/feature-actions` | Gán action cho feature |
| DELETE | `/api/feature-actions?featureId=...&actionId=...` | Gỡ action khỏi feature |

### Roles API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | Danh sách vai trò |
| POST | `/api/roles` | Tạo vai trò mới |
| PUT | `/api/roles/{id}` | Cập nhật vai trò (bao gồm permissions) |
| DELETE | `/api/roles/{id}` | Xóa vai trò |
| GET | `/api/roles/{id}/users` | Danh sách users của vai trò |
| POST | `/api/roles/{id}/users` | Gán users vào vai trò (body: `{userIds: string[]}`) |
| DELETE | `/api/roles/{id}/users/{userId}` | Gỡ user khỏi vai trò |

**Roles mặc định**: Quản trị hệ thống, Quản lý kho, Nhân viên kho, Kế toán, Người xem

### Permission Structure (Normalized)

Permissions được lưu trong bảng `RoleFeatureAction` (many-to-many relationship):

```
Role ↔ RoleFeatureAction ↔ FeatureAction ↔ Feature + Action
```

**API Response format** (khi GET Role):

```json
{
  "id": "role-uuid",
  "name": "Kế toán",
  "roleFeatureActions": [
    {
      "id": "rfa-uuid",
      "featureAction": {
        "id": "fa-uuid",
        "feature": { "code": "dashboard", "name": "Dashboard" },
        "action": { "code": "view", "name": "Xem" }
      }
    }
  ]
}
```

> **Note**: Hệ thống đã được refactor từ JSON `permissions` field sang normalized `RoleFeatureAction` table.

---

## Custom Hooks (Permission Management)

| Hook | Usage |
|------|-------|
| `useActions()` | CRUD operations cho Actions |
| `useFeatures(grouped?)` | CRUD operations cho Features |
| `useFeatureActions()` | Manage feature-action mappings |
| `useRolesManagement()` | CRUD operations cho Roles với permissions |
| `useRoleUsers(roleId)` | Gán/gỡ users vào/khỏi Role |

---

## Material Request API

API cho quản lý yêu cầu vật tư với FK relations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/material-requests` | Danh sách yêu cầu (pagination, search, filter) |
| POST | `/api/material-requests` | Tạo yêu cầu mới (transactional với items) |
| GET | `/api/material-requests/{id}` | Chi tiết 1 yêu cầu |
| PUT | `/api/material-requests/{id}` | Cập nhật yêu cầu |
| DELETE | `/api/material-requests/{id}` | Xóa yêu cầu (cascade delete items) |
| POST | `/api/material-requests/{id}/approve` | Duyệt/từ chối yêu cầu (body: `{approved, approverId}`) |

### Query Parameters cho GET `/api/material-requests`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Số trang (mặc định: 1) |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) |
| `search` | string | Tìm theo mã yêu cầu, tên người yêu cầu |
| `departmentId` | string | Filter theo ID phòng ban (FK) |
| `statusId` | string | Filter theo ID trạng thái (FK) |
| `priorityId` | string | Filter theo ID độ ưu tiên (FK) |

### Request Body (POST/PUT)

```json
{
  "requesterId": "user-uuid",
  "departmentId": "dept-uuid",
  "priorityId": "priority-uuid",
  "statusId": "status-uuid",
  "reason": "Thay thế bơm hỏng",
  "requestDate": "2026-02-01T00:00:00Z",
  "workOrder": "WO-2026-001",
  "items": [
    {
      "materialId": "material-uuid",
      "unitId": "unit-uuid",
      "requestedQuantity": 2,
      "stock": 5,
      "notes": "Cần gấp"
    }
  ]
}
```

### Response Format (GET list)

```json
{
  "data": [{
    "id": "uuid",
    "requestCode": "MR-2026-001",
    "requesterId": "user-uuid",
    "departmentId": "dept-uuid",
    "priorityId": "priority-uuid",
    "statusId": "status-uuid",
    "requester": { "id": "...", "name": "Nguyễn Văn A", "employeeCode": "NV001" },
    "department": { "id": "...", "name": "Vận hành" },
    "priority": { "id": "...", "name": "Cao", "color": "#FF0000" },
    "status": { "id": "...", "name": "Chờ duyệt", "color": "#FFA500" },
    "reason": "Thay thế bơm hỏng",
    "requestDate": "2026-02-01T00:00:00Z",
    "items": [
      {
        "id": "item-uuid",
        "materialId": "material-uuid",
        "material": { "id": "...", "code": "PM-001", "name": "Bơm thủy lực" },
        "unitId": "unit-uuid",
        "unit": { "id": "...", "name": "Cái" },
        "requestedQuantity": 2,
        "stock": 5
      }
    ]
  }],
  "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
}
```

> **Note**: Material Request API sử dụng FK relations. Client gửi IDs, API trả về nested objects. Items được tạo/cập nhật trong transaction.

---

## Purchase Request API

API cho quản lý yêu cầu mua sắm với FK relations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-requests` | Danh sách yêu cầu (pagination, search, filter) |
| POST | `/api/purchase-requests` | Tạo yêu cầu mới (transactional với items) |
| GET | `/api/purchase-requests/{id}` | Chi tiết 1 yêu cầu |
| PUT | `/api/purchase-requests/{id}` | Cập nhật yêu cầu |
| DELETE | `/api/purchase-requests/{id}` | Xóa yêu cầu (cascade delete items) |

### Query Parameters cho GET `/api/purchase-requests`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Số trang (mặc định: 1) |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) |
| `search` | string | Tìm theo mã yêu cầu, tên người yêu cầu, mô tả |
| `sourceId` | string | Filter theo ID nguồn vật tư (FK) |
| `statusId` | string | Filter theo ID trạng thái (FK) |

### Request Body (POST/PUT)

```json
{
  "requesterId": "user-uuid",
  "departmentId": "dept-uuid",
  "sourceId": "source-uuid",
  "fundingSourceId": "funding-uuid",
  "description": "Mua thiết bị thay thế",
  "items": [
    {
      "materialId": "material-uuid",
      "name": "Bơm thủy lực ABC",
      "unitId": "unit-uuid",
      "quantity": 2,
      "estimatedPrice": 50000000,
      "suggestedSupplierId": "supplier-uuid"
    }
  ]
}
```

### Response Format (GET list)

```json
{
  "data": [{
    "id": "PR-2026-001",
    "requestCode": "PR-2026-001",
    "requesterId": "user-uuid",
    "departmentId": "dept-uuid",
    "statusId": "status-uuid",
    "sourceId": "source-uuid",
    "fundingSourceId": "funding-uuid",
    "requester": { "id": "...", "name": "Nguyễn Văn A", "employeeCode": "NV001" },
    "department": { "id": "...", "code": "VH", "name": "Vận hành" },
    "status": { "id": "...", "code": "PEND", "name": "Chờ duyệt", "color": "#FFA500" },
    "source": { "id": "...", "code": "NB", "name": "Trong nước" },
    "fundingSource": { "id": "...", "code": "OPEX", "name": "Chi phí vận hành" },
    "description": "Mua thiết bị thay thế",
    "totalAmount": 100000000,
    "step": 2,
    "items": [
      {
        "id": "item-uuid",
        "materialId": "material-uuid",
        "material": { "id": "...", "code": "PM-001", "name": "Bơm thủy lực" },
        "name": "Bơm thủy lực ABC",
        "unitId": "unit-uuid",
        "unit": { "id": "...", "code": "CAI", "name": "Cái" },
        "suggestedSupplierId": "supplier-uuid",
        "suggestedSupplier": { "id": "...", "name": "ABC Company" },
        "quantity": 2,
        "estimatedPrice": 50000000
      }
    ]
  }],
  "pagination": { "page": 1, "limit": 10, "total": 20, "totalPages": 2 }
}
```

> **Note**: Purchase Request API sử dụng FK relations. Client gửi IDs, API trả về nested objects. Items cascade delete khi xóa request.

---

## Bidding Packages API

API cho quản lý gói thầu với full workflow:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bidding-packages` | Danh sách gói thầu (pagination, search, filter) |
| POST | `/api/bidding-packages` | Tạo gói thầu mới (với PRs, scope items) |
| GET | `/api/bidding-packages/{id}` | Chi tiết gói thầu (id = packageCode) |
| PUT | `/api/bidding-packages/{id}` | Cập nhật gói thầu |
| DELETE | `/api/bidding-packages/{id}` | Xóa gói thầu (cascade) |

### Participants Sub-API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bidding-packages/{id}/participants` | Danh sách nhà thầu tham gia |
| POST | `/api/bidding-packages/{id}/participants` | Thêm nhà thầu (body: `{supplierIds: string[]}`) |
| DELETE | `/api/bidding-packages/{id}/participants?participantId=...` | Xóa nhà thầu |
| PATCH | `/api/bidding-packages/{id}/participants` | Cập nhật điểm, quotations |

### Winner Selection

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bidding-packages/{id}/select-winner` | Chọn nhà thầu trúng thầu (body: `{winnerId}`) |

### Query Parameters cho GET `/api/bidding-packages`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Số trang (mặc định: 1) |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) |
| `search` | string | Tìm theo mã gói thầu, tên |
| `methodId` | string | Filter theo ID phương thức đấu thầu (FK) |
| `statusId` | string | Filter theo ID trạng thái (FK) |

### Request Body (POST)

```json
{
  "name": "Mua thiết bị đo lường 2026",
  "methodId": "method-uuid",
  "createdById": "user-uuid",
  "estimatedBudget": 500000000,
  "openDate": "2026-02-15T00:00:00Z",
  "closeDate": "2026-03-15T00:00:00Z",
  "notes": "Gói thầu thiết bị đo lường",
  "purchaseRequestIds": ["pr-uuid-1", "pr-uuid-2"],
  "scopeItems": [
    {
      "materialId": "material-uuid",
      "name": "Cảm biến áp suất",
      "unitId": "unit-uuid",
      "quantity": 10,
      "estimatedAmount": 50000000
    }
  ]
}
```

### Response Format (GET detail)

```json
{
  "data": {
    "id": "TB-2026-01",
    "packageCode": "TB-2026-01",
    "name": "Mua thiết bị đo lường 2026",
    "methodId": "method-uuid",
    "statusId": "status-uuid",
    "method": { "id": "...", "code": "OPEN", "name": "Đấu thầu rộng rãi" },
    "status": { "id": "...", "code": "INVITE", "name": "Đang mời thầu", "color": "#FFA500" },
    "createdBy": { "id": "...", "name": "Nguyễn Văn A", "employeeCode": "NV001" },
    "winner": null,
    "estimatedBudget": 500000000,
    "openDate": "2026-02-15T00:00:00Z",
    "closeDate": "2026-03-15T00:00:00Z",
    "step": 1,
    "purchaseRequests": [
      { "id": "...", "requestCode": "PR-2026-001", "description": "...", "totalAmount": 100000000 }
    ],
    "participants": [
      {
        "id": "participant-uuid",
        "supplier": { "id": "...", "code": "SUP-001", "name": "ABC Company" },
        "invitedAt": "2026-02-01T00:00:00Z",
        "isSubmitted": true,
        "technicalScore": 85,
        "priceScore": 90,
        "totalScore": 87,
        "rank": 1,
        "quotations": [...]
      }
    ],
    "scopeItems": [
      {
        "id": "scope-uuid",
        "materialId": "material-uuid",
        "material": { "id": "...", "code": "PM-001", "name": "Cảm biến áp suất" },
        "name": "Cảm biến áp suất",
        "unitId": "unit-uuid",
        "unit": { "id": "...", "code": "CAI", "name": "Cái" },
        "quantity": 10,
        "estimatedAmount": 50000000
      }
    ]
  }
}
```

> **Note**: Bidding Packages API sử dụng `packageCode` làm ID trong URL. Workflow: Invite → Receive → Evaluate → Done.

---

## Inbound API

API cho quản lý phiếu nhập kho:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inbound` | Danh sách phiếu nhập (pagination, search, filter) |
| POST | `/api/inbound` | Tạo phiếu nhập mới |
| GET | `/api/inbound/{id}` | Chi tiết 1 phiếu nhập |
| PUT | `/api/inbound/{id}` | Cập nhật phiếu nhập |
| DELETE | `/api/inbound/{id}` | Xóa phiếu nhập |

### Request Body (POST/PUT)

```json
{
  "inboundType": "Nhập mua",
  "reference": "PO-2026-001",
  "inboundDate": "2026-02-01T00:00:00Z",
  "partner": "ABC Company",
  "status": "Chờ nhập",
  "items": [
    {
      "materialId": "uuid",
      "quantity": 10,
      "unitPrice": 500000
    }
  ]
}
```

> **Note**: Inbound API sử dụng string columns thay vì FK relations (chưa được normalize). Cần refactor trong tương lai.


