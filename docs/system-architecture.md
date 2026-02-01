# System Architecture

## Overview

PowerTrack Logistics is an O&M (Operation & Maintenance) inventory management system for power plants, built on a modern full-stack architecture.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js 15.5 App Router                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │   │
│  │  │   Pages    │  │ Components │  │   API Routes   │  │   │
│  │  │ (21 routes)│  │    (36+)   │  │  (44+ routes)  │  │   │
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
| AI | Firebase Genkit + Gemini 2.5 Flash | Latest |

## Frontend Pages (21 routes)

| Route | Description |
|-------|-------------|
| `/` | Dashboard |
| `/login` | Authentication |
| `/profile` | User profile |
| `/materials` | Material catalog management |
| `/suppliers` | Supplier management |
| `/warehouses` | Warehouse location management |
| `/material-requests` | Material requisition workflow |
| `/purchase-requests` | Procurement workflow |
| `/biddings` | Bidding package management |
| `/inbound` | Goods receipt (GRN) |
| `/outbound` | Goods issue (GIV) |
| `/stock-take` | Physical inventory counting |
| `/reports/inventory` | Inventory report |
| `/reports/safety-stock` | Safety stock alerts |
| `/reports/slow-moving` | Slow-moving items |
| `/users` | User management |
| `/roles` | Role management |
| `/settings` | Master data configuration |
| `/activity-log` | Audit log |
| `/lifecycle` | Material lifecycle tracking |

## Data Flow

```
User Action → React Component → API Route → Prisma Client → PostgreSQL
                    ↑                              │
                    └──────── Response ←───────────┘
```

## Architectural Patterns

### Component Architecture
- **Server Components**: Data fetching, layout structure
- **Client Components**: Interactivity, forms, tables (with `"use client"`)
- **API Routes**: Business logic, database operations via Prisma

### State Management
- **Server State**: SWR / useEffect fetchers from `/api/*`
- **Form State**: react-hook-form + Zod validation
- **Global State**: URL search params for filters/pagination

## Configuration Files

| File | Purpose |
|------|---------|
| `prisma.config.ts` | Prisma 7 config (datasource, seed) |
| `prisma/schema.prisma` | Database schema definition |
| `docker-compose.yml` | PostgreSQL container |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `next.config.ts` | Next.js configuration |

---

## API Endpoints Summary

### Master Data API

Generic API for 24 master data tables:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/master-data/{tableId}` | List items |
| POST | `/api/master-data/{tableId}` | Create item |
| GET | `/api/master-data/{tableId}/{id}` | Get item |
| PUT | `/api/master-data/{tableId}/{id}` | Update item |
| DELETE | `/api/master-data/{tableId}/{id}` | Soft delete |

**tableId values**: `material-status`, `material-category`, `material-unit`, `management-type`, `warehouse-area`, `warehouse-type`, `warehouse-status`, `supplier-type`, `payment-term`, `currency`, `request-priority`, `request-status`, `purchase-source`, `purchase-status`, `bidding-method`, `bidding-status`, `inbound-type`, `inbound-status`, `outbound-purpose`, `outbound-status`, `stocktake-status`, `stocktake-area`, `user-status`, `activity-action`, `department`, `country`

---

### Materials API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/materials` | List (pagination, search, filter by categoryId/statusId) |
| POST | `/api/materials` | Create material |
| GET | `/api/materials/{id}` | Get material |
| PUT | `/api/materials/{id}` | Update material |
| DELETE | `/api/materials/{id}` | Delete material |

---

### Warehouse Locations API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warehouse-locations` | List with FK relations |
| POST | `/api/warehouse-locations` | Create location |
| GET | `/api/warehouse-locations/{id}` | Get location |
| PUT | `/api/warehouse-locations/{id}` | Update location |
| DELETE | `/api/warehouse-locations/{id}` | Delete location |

**FK Relations**: areaId → WarehouseArea, typeId → WarehouseType, statusId → WarehouseStatus

---

### Suppliers API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List with contacts |
| POST | `/api/suppliers` | Create with contacts |
| GET | `/api/suppliers/{id}` | Get with contacts |
| PUT | `/api/suppliers/{id}` | Update (transactional) |
| DELETE | `/api/suppliers/{id}` | Cascade delete contacts |

**FK Relations**: countryId, typeId, paymentTermId, currencyId

---

### Users & Permissions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/users` | List/Create users |
| GET/PUT/DELETE | `/api/users/{id}` | User CRUD |
| GET/POST | `/api/roles` | List/Create roles |
| GET/PUT/DELETE | `/api/roles/{id}` | Role CRUD |
| GET/POST | `/api/roles/{id}/users` | Manage role members |
| GET/POST | `/api/actions` | CRUD actions |
| GET/POST | `/api/features` | CRUD features (grouped) |
| GET/POST/DELETE | `/api/feature-actions` | Manage mappings |

**Permission Model**: Role ↔ RoleFeatureAction ↔ FeatureAction ↔ Feature + Action

---

### Material Requests API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/material-requests` | List with filters |
| POST | `/api/material-requests` | Create with items |
| GET | `/api/material-requests/{id}` | Get with items |
| PUT | `/api/material-requests/{id}` | Update |
| DELETE | `/api/material-requests/{id}` | Cascade delete items |
| POST | `/api/material-requests/{id}/approve` | Approve/Reject |

**FK Relations**: requesterId, departmentId, priorityId, statusId, approverId

---

### Purchase Requests API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-requests` | List with filters |
| POST | `/api/purchase-requests` | Create with items |
| GET | `/api/purchase-requests/{id}` | Get with items |
| PUT | `/api/purchase-requests/{id}` | Update |
| DELETE | `/api/purchase-requests/{id}` | Cascade delete items |

**FK Relations**: requesterId, departmentId, statusId, sourceId, fundingSourceId

---

### Bidding Packages API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bidding-packages` | List packages |
| POST | `/api/bidding-packages` | Create with PRs, scope items |
| GET | `/api/bidding-packages/{id}` | Get package (id=packageCode) |
| PUT | `/api/bidding-packages/{id}` | Update package |
| DELETE | `/api/bidding-packages/{id}` | Cascade delete |
| GET/POST | `/api/bidding-packages/{id}/participants` | Manage participants |
| PATCH | `/api/bidding-packages/{id}/participants` | Update scores/quotations |
| DELETE | `/api/bidding-packages/{id}/participants?participantId=...` | Remove participant |
| POST | `/api/bidding-packages/{id}/select-winner` | Select winner |

**Workflow**: Invite → Receive → Evaluate → Done

---

### Inbound API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inbound` | List receipts |
| POST | `/api/inbound` | Create receipt |
| GET | `/api/inbound/{id}` | Get receipt |
| PUT | `/api/inbound/{id}` | Update receipt |
| DELETE | `/api/inbound/{id}` | Delete receipt |

**FK Relations**: typeId → InboundType, supplierId → Supplier, statusId → InboundStatus

---

### Outbound API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/outbound` | List vouchers |
| POST | `/api/outbound` | Create voucher |
| GET | `/api/outbound/{id}` | Get voucher |
| PUT | `/api/outbound/{id}` | Update voucher |
| DELETE | `/api/outbound/{id}` | Delete voucher |
| POST | `/api/outbound/{id}/approve` | Approve issue |
| POST | `/api/outbound/{id}/issue` | Execute issue (decrement stock) |

**Workflow**: Draft → Approved → Issued
**FK Relations**: purposeId, statusId, requesterId, departmentId

---

### Stocktake API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocktake` | List stocktakes |
| POST | `/api/stocktake` | Create stocktake with assignments |
| GET | `/api/stocktake/{id}` | Get stocktake details |
| PUT | `/api/stocktake/{id}` | Update stocktake |
| DELETE | `/api/stocktake/{id}` | Delete stocktake |
| POST | `/api/stocktake/{id}/start` | Start counting |
| POST | `/api/stocktake/{id}/reconcile` | Reconcile variances |
| POST | `/api/stocktake/{id}/complete` | Complete stocktake |
| GET/POST | `/api/stocktake/{id}/assignments` | Manage location assignments |
| PUT/DELETE | `/api/stocktake/{id}/assignments/{assignId}` | Update/remove assignment |
| GET/POST/PUT | `/api/stocktake/{id}/results` | Manage counting results |

**Workflow**: Draft → In Progress → Reconciling → Completed
**FK Relations**: statusId → StocktakeStatus, areaId → StocktakeArea, createdById → User

**Code Pattern**: `KK-YYYY-XXX` (auto-generated)

---

## Custom Hooks

| Hook | Usage |
|------|-------|
| `useMasterData(tableId)` | CRUD for master data tables |
| `useUsers()` | CRUD for users, roles, departments |
| `usePermissions()` | Actions, features, roles management |
| `useMaterialRequests()` | Material request CRUD |
| `useToast()` | Toast notifications |
| `useMobile()` | Mobile breakpoint detection |

---

## Auto-Generated Codes

| Entity | Pattern | Example |
|--------|---------|---------|
| Bidding Package | `TB-YYYY-XX` | TB-2026-01 |
| Purchase Request | `PR-YYYY-XXX` | PR-2026-001 |
| Material Request | `MR-YYYY-XXX` | MR-2026-001 |
| Inbound Receipt | `NK-YYYY-XXX` | NK-2026-001 |
| Outbound Voucher | `XK-YYYY-XXX` | XK-2026-001 |
| Stocktake | `KK-YYYY-XXX` | KK-2026-001 |

---

## Security Considerations

### Current State
- Email-based authentication (no password)
- RBAC via Role → FeatureAction mappings
- Activity logging for audit trail

### Known Gaps
- No authentication middleware on API routes
- Default user fallback in some routes
- No rate limiting
- No API versioning

### Recommended Improvements
- Add NextAuth.js or Clerk for auth
- Implement API middleware for auth checks
- Add rate limiting for public endpoints
- Version APIs (e.g., `/api/v1/...`)
