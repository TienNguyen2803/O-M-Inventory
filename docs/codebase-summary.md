# Codebase Summary

**Last Updated:** 2026-02-01
**Version:** 1.3.0-dev
**Status:** Hybrid (Connected & Mock/Prototype)

## Overview

PowerTrack Logistics (O-M-Inventory) is a Next.js 15.5 application designed for inventory management in power plants. The codebase is currently in a **hybrid state**, containing both fully functional modules connected to a real PostgreSQL database (via Prisma 7) and prototype modules running on mock data.

## Directory Structure

### `src/app` (Next.js App Router)

The application uses the App Router structure with distinct modules:

| Directory | Module | Status | Description |
|-----------|--------|--------|-------------|
| `api/` | **API Routes** | **Real** | REST endpoints for Auth, Users, Roles, Materials, Material Requests, Purchase Requests, Bidding Packages, Warehouse Locations, Suppliers. Connected to Prisma. |
| `materials/` | **Materials** | **Real** | Full CRUD for materials. Fetches data from API. |
| `material-requests/` | **Requests** | **Real** | Request creation with items, approval workflow. FK relations to User, Department, Priority, Status. |
| `warehouses/` | **Warehouse Locations** | **Real** | Full CRUD with FK relations. Uses Zod validation. |
| `suppliers/` | **Suppliers** | **Real** | Full CRUD with contacts management. FK relations to master data. |
| `purchase-requests/` | **Purchase Requests** | **Real** | Full CRUD with items, FK relations to master data. Transactional. |
| `biddings/` | **Bidding Management** | **Real** | Full CRUD with participants, quotations, winner selection. FK to BiddingMethod, BiddingStatus, User, Supplier. Includes scope items editor. |
| `inbound/` | **Inbound** | **Partial** | UI complete. API at `/api/inbound` (uses string columns, not FK). |
| `outbound/` | **Outbound** | **Mock** | UI prototype for outbound vouchers. No API backend yet. |
| `lifecycle/` | **Lifecycle** | **Mock** | Timeline view of material history. Uses mock data. |
| `reports/` | **Reports** | **Hybrid** | UI exists, but calculation logic is client-side heavy. |
| `dashboard/` | **Dashboard** | **Mock** | Charts and widgets using hardcoded/mock data. |

### `src/lib` (Utilities)

- **`data.ts`**: ⚠️ **Legacy/Mock Data** (1275 LOC). Large file containing static data used by prototype modules (Inbound, Outbound, Dashboard). Needs refactoring and deprecation as backend services are implemented.
- **`prisma.ts`**: Database client instance.
- **`utils.ts`**: Common utility functions (CN for Tailwind, formatters).
- **`types.ts`**: TypeScript type definitions.
- **`validations/`**: Zod validation schemas for API endpoints.
  - `inbound.ts`: Inbound receipt validation.
  - `warehouse-location.ts`: Warehouse location CRUD validation.
  - `purchase-request.ts`: Purchase request validation.
  - `bidding-package.ts`: Bidding package validation.

### `prisma/` (Database)

- **`schema.prisma`**: Defines the data model for the entire system (both current real modules and future ones).
- **`seed.ts`**: Populates Master Data (Status, Categories, Units, etc.).

## Key Technical Observations

### 1. Hybrid Data Fetching
- **Real Modules**: Use React hooks (`useSWR` or custom `useEffect` hooks) to fetch from `/api/*` endpoints.
- **Mock Modules**: Import data directly from `src/lib/data.ts` or define local constants.

### 2. Authentication
- **Current State**: Basic email-based authentication (likely custom or simple provider).
- **Security Note**: Needs hardening before production.

### 3. UI/UX Patterns
- **Component Library**: Shadcn UI (Radix Primitives + Tailwind).
- **Forms**: React Hook Form + Zod validation.
- **Tables**: TanStack Table (React Table v8) for complex data grids.
- **Client vs Server**: Heavy use of Client Components (`"use client"`) for interactivity, with Server Components serving as layout wrappers.

## Critical Technical Debt

1.  **`src/lib/data.ts` dependency** (1275 LOC): Large legacy file. Prototype modules rely on this. Must be maintained until backend APIs for Outbound are ready. Consider splitting by domain.
2.  **`src/hooks/use-permissions.ts`** (535 LOC): Contains 6 hooks in 1 file. Needs splitting into separate files.
3.  **Client-side Reports**: Reporting logic happens in browser. Will not scale with real data. Needs migration to server-side aggregation (Prisma `groupBy` / Raw SQL).
4.  **Missing API Routes**: `outbound` and `stock-take` modules have UI but no backend logic.
5.  **API Validation Coverage**: `inbound`, `warehouse-locations`, `purchase-request`, `bidding-package` use Zod validation. Others need migration.
6.  **No Auth Middleware**: API routes lack authentication middleware. Security hardening needed.
7.  **String Columns in Legacy Tables**: InboundReceipt, OutboundVoucher, StockTake use string columns instead of FK relations.

## Module Detail: Materials (Reference Implementation)
The `src/app/materials` module serves as the **gold standard** for the rest of the app:
- **List View**: Server-side pagination support (ready in API), Client-side filtering.
- **Forms**: Validated with Zod schema.
- **Data Access**: Decoupled via API routes.
