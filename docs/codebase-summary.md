# Codebase Summary

**Last Updated:** 2026-02-01
**Version:** 1.0.0
**Status:** Hybrid (Connected & Mock/Prototype)

## Overview

PowerTrack Logistics (O-M-Inventory) is a Next.js 14 application designed for inventory management in power plants. The codebase is currently in a **hybrid state**, containing both fully functional modules connected to a real PostgreSQL database (via Prisma) and prototype modules running on mock data.

## Directory Structure

### `src/app` (Next.js App Router)

The application uses the App Router structure with distinct modules:

| Directory | Module | Status | Description |
|-----------|--------|--------|-------------|
| `api/` | **API Routes** | ✅ **Real** | REST endpoints for Auth, Users, Roles, Materials, Requests. Connected to Prisma. |
| `materials/` | **Materials** | ✅ **Real** | Full CRUD for materials. Fetches data from API. |
| `material-requests/` | **Requests** | ✅ **Real** | Request creation and approval workflow. Connected to DB. |
| `inbound/` | **Inbound** | 🚧 **Mock** | UI prototype for inbound shipments. No API backend yet. |
| `outbound/` | **Outbound** | 🚧 **Mock** | UI prototype for outbound vouchers. No API backend yet. |
| `lifecycle/` | **Lifecycle** | 🚧 **Mock** | Timeline view of material history. Uses mock data. |
| `reports/` | **Reports** | ⚠️ **Hybrid** | UI exists, but calculation logic is client-side heavy. |
| `dashboard/` | **Dashboard** | 🚧 **Mock** | Charts and widgets using hardcoded/mock data. |

### `src/lib` (Utilities)

- **`data.ts`**: ⚠️ **Legacy/Mock Data**. A large file containing static data used by the prototype modules (Inbound, Outbound, Dashboard). This needs to be phased out as backend services are implemented.
- **`prisma.ts`**: Database client instance.
- **`utils.ts`**: Common utility functions (CN for Tailwind, formatters).

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

1.  **`src/lib/data.ts` dependency**: The prototype modules rely heavily on this file. It must be maintained until the backend APIs for Inbound/Outbound are ready.
2.  **Client-side Reports**: Reporting logic happens in the browser, which will not scale with real data volume. Needs migration to Server-side aggregation (Prisma `groupBy` / Raw SQL).
3.  **Missing API Routes**: `inbound`, `outbound`, and `stock-take` modules have UI but no backend logic.

## Module Detail: Materials (Reference Implementation)
The `src/app/materials` module serves as the **gold standard** for the rest of the app:
- **List View**: Server-side pagination support (ready in API), Client-side filtering.
- **Forms**: Validated with Zod schema.
- **Data Access**: Decoupled via API routes.
