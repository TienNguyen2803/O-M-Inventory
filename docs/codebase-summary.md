# Codebase Summary

**Last Updated:** 2026-02-01
**Version:** 1.5.0
**Status:** Production Ready (All Core Modules Live)

## Overview

PowerTrack Logistics (O-M-Inventory) is a Next.js 15.5 application for inventory management in power plants. The codebase has transitioned from prototype to production-ready state with all core modules fully connected to PostgreSQL via Prisma 7.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.5 (App Router) |
| Runtime | React 19, TypeScript |
| Database | PostgreSQL + Prisma 7 with PrismaPg adapter |
| UI | shadcn/ui (Radix + Tailwind), recharts, lucide-react |
| Forms | react-hook-form + Zod validation |
| AI | Firebase Genkit with Gemini 2.5 Flash |

## Directory Structure

### `src/app` (Next.js App Router)

| Directory | Module | Status | Description |
|-----------|--------|--------|-------------|
| `api/` | **API Routes** | Live | 20 endpoint groups, 46 routes connected to Prisma |
| `materials/` | Materials | Live | Full CRUD with FK relations |
| `material-requests/` | Requests | Live | Approval workflow with items |
| `purchase-requests/` | Purchase | Live | Procurement workflow |
| `biddings/` | Bidding | Live | Full workflow with participants, quotations |
| `warehouses/` | Locations | Live | Full CRUD with FK relations |
| `suppliers/` | Suppliers | Live | CRUD with contacts management |
| `inbound/` | Inbound | Live | Goods receipt with FK relations, KCS |
| `outbound/` | Outbound | Live | Goods issue with stock decrement |
| `stock-take/` | Stocktake | Live | Counting with assignments and reconciliation |
| `lifecycle/` | Lifecycle | Live | Material lifecycle timeline tracking |
| `goods-history/` | History | Live | Material movement history search |
| `users/`, `roles/` | Auth | Live | RBAC with feature-action permissions |
| `reports/` | Reports | Hybrid | UI exists, client-side calculations |
| `dashboard/` | Dashboard | Hybrid | Charts with partial live data |

### `src/lib` (Utilities)

| File | Description |
|------|-------------|
| `db.ts` | Prisma client singleton |
| `types.ts` | TypeScript interfaces |
| `master-data-tables.ts` | 28 master data table mappings |
| `validations/` | Zod schemas (inbound, outbound, stocktake, warehouse-location, lifecycle) |

### `src/components`

| Directory | Description |
|-----------|-------------|
| `ui/` | 35 shadcn/ui components |
| `layout/` | AppLayout, AppHeader, SidebarNav (5 nav groups, 19 items) |
| `shared/` | PageHeader and shared components |

### `src/hooks`

Custom hooks: `useToast`, `useMasterData`, `useUsers`, `usePermissions`, `useMaterialRequests`

## API Endpoints (20 groups, 46 routes)

- **Auth**: `/api/auth/login` (email-based)
- **Users/Roles**: CRUD + role assignment + RBAC
- **Materials**: Material catalog CRUD + lifecycle
- **Suppliers**: Vendor management
- **Warehouse Locations**: Storage hierarchy
- **Master Data**: Dynamic CRUD for 28 lookup tables
- **Material Requests**: Requisition + approval workflow
- **Purchase Requests**: PR management
- **Bidding Packages**: Bidding workflow
- **Inbound**: Goods receipt with KCS
- **Outbound**: Goods issue with stock decrement
- **Stocktake**: Counting, assignments, results, reconciliation
- **Lifecycle**: Material events + installations

## Database (~55 tables)

- **Master Data**: 28 lookup tables (statuses, types, categories)
- **Business Data**: Material, Supplier, WarehouseLocation, MaterialRequest, PurchaseRequest, BiddingPackage, InboundReceipt, OutboundReceipt, Stocktake
- **Lifecycle**: MaterialEvent, Installation
- **User/Permissions**: User, Role, Action, Feature, FeatureAction, RoleFeatureAction, ActivityLog, InventoryLog

## Known Technical Debt

1. **No Auth Middleware**: API routes lack authentication middleware
2. **Default User Fallback**: Some routes use first user as default
3. **Client-side Reports**: Reporting logic in browser, needs server-side aggregation
4. **No Rate Limiting**: Public endpoints unprotected
5. **No API Versioning**: Consider `/api/v1/...` for future

## Reference Implementation

The `src/app/materials` module serves as the **gold standard**:
- Server-side pagination via API
- Client-side filtering
- Zod validation
- Decoupled data access via API routes
- Lifecycle event tracking integration
