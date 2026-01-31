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
│  │  │ 24 Master Tables │  │  Business Data Tables     │ │   │
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

- **24 Master Data Tables**: Các bảng lookup data riêng biệt, dễ mở rộng
- **Business Tables**: Materials, Suppliers, Warehouses, Requests, etc.
- **Prisma 7 với PostgreSQL Adapter**: Sử dụng `@prisma/adapter-pg` cho connection pooling

## Data Flow

```
User Action → React Component → API Route → Prisma Client → PostgreSQL
                    ↑                              │
                    └──────── Response ←───────────┘
```

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

Generic API cho quản lý 24 bảng master data:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/{tableId}` | Lấy danh sách items |
| POST | `/api/master-data/{tableId}` | Tạo item mới |
| GET | `/api/master-data/{tableId}/{id}` | Lấy 1 item |
| PUT | `/api/master-data/{tableId}/{id}` | Cập nhật item |
| DELETE | `/api/master-data/{tableId}/{id}` | Xóa item (soft delete) |

**tableId** là một trong 24 giá trị:
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

---

## Custom Hooks

| Hook | Usage |
|------|-------|
| `useMasterDataTable(tableId)` | CRUD operations cho 1 bảng master data |
| `useMasterDataItems(tableId)` | Fetch items cho dropdowns/selects |
| `useUsers()` | CRUD operations cho User Management với pagination, search, filter |
| `useRoles()` | Fetch roles cho dropdowns |
| `useDepartments()` | Fetch departments cho dropdowns |

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
| `department` | string | Filter theo phòng ban |
| `role` | string | Filter theo vai trò |
| `status` | string | Filter theo trạng thái |

---

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

**Roles mặc định**: Quản trị hệ thống, Quản lý kho, Nhân viên kho, Kế toán, Người xem

### Permission Structure

Permissions được lưu dưới dạng JSON trong Role:

```json
{
  "dashboard": ["view"],
  "materials": ["view", "create", "edit", "delete"],
  "users": ["view", "create", "edit", "delete", "approve"],
  "settings": ["view", "edit"]
}
```

---

## Custom Hooks (Permission Management)

| Hook | Usage |
|------|-------|
| `useActions()` | CRUD operations cho Actions |
| `useFeatures(grouped?)` | CRUD operations cho Features |
| `useFeatureActions()` | Manage feature-action mappings |
| `useRolesManagement()` | CRUD operations cho Roles với permissions |


