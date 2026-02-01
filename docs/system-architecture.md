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
│  │  │ (18 routes)│  │    (39)    │  │  (/api/...)    │  │   │
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

### Frontend Pages (18 routes)

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

1.  **Fully Connected Modules** (Materials, Requests, Auth):
    - Follow standard **Next.js App Router** patterns.
    - **Server Components** for initial data fetch (where possible) or Skeleton loaders.
    - **Client Components** for interactivity (Forms, Tables) fetching data via `fetch` or `SWR` from `/api/*` endpoints.
    - **API Routes** handle business logic and DB interaction via Prisma.

2.  **Prototype Modules** (Inbound, Outbound, Dashboard):
    - UI Components are built but feed on **Mock Data** (`src/lib/data.ts`).
    - No backend integration yet.
    - *Architecture Goal*: Migrate these to the Connected pattern in Phase 2.

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
| `useMasterDataTable(tableId)` | CRUD operations cho 1 bảng master data |
| `useMasterDataItems(tableId)` | Fetch items cho dropdowns/selects |
| `useUsers()` | CRUD operations cho User Management với pagination, search, filter |
| `useRoles()` | Fetch roles cho dropdowns |
| `useDepartments()` | Fetch departments cho dropdowns |
| `useMaterialRequests()` | CRUD operations cho Material Request với pagination, search, filter |
| `useRoleUsers(roleId)` | CRUD operations cho gán User vào Role |

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

API cho quản lý yêu cầu vật tư:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/material-requests` | Danh sách yêu cầu (pagination, search, filter) |
| POST | `/api/material-requests` | Tạo yêu cầu mới |
| GET | `/api/material-requests/{id}` | Chi tiết 1 yêu cầu |
| PUT | `/api/material-requests/{id}` | Cập nhật yêu cầu |
| DELETE | `/api/material-requests/{id}` | Xóa yêu cầu (soft delete) |
| POST | `/api/material-requests/{id}/approve` | Phê duyệt yêu cầu |

### Query Parameters cho GET `/api/material-requests`

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Số trang (mặc định: 1) |
| `limit` | number | Số lượng mỗi trang (mặc định: 10) |
| `search` | string | Tìm theo mã yêu cầu, tên người yêu cầu |
| `department` | string | Filter theo phòng ban |
| `status` | string | Filter theo trạng thái |
| `priority` | string | Filter theo độ ưu tiên |


