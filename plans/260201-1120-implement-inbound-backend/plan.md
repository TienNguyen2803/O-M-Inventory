---
title: "Implement Inbound Logistics (Goods Receipt) Backend & Integration"
description: "Implement real backend API for Inbound Receipts with stock update logic and integrate with frontend."
status: pending
priority: P1
effort: 3d
branch: main
tags: [inbound, backend, prisma, transaction]
created: 2026-02-01
---

# Implement Inbound Logistics (Goods Receipt) Module

## Context
Currently, the Inbound module (`/inbound`) is a UI prototype using mock data. We need to implement the actual backend logic, including database transactions to update stock levels when goods are received, and connect the frontend to these APIs.

## Goals
1.  **API Implementation**: Create robust API endpoints for Inbound Receipts.
2.  **Business Logic**: Implement "Goods Receipt" logic (Stock Update + Inventory Log + Warehouse Item update) using Prisma Transactions.
3.  **Frontend Integration**: Connect the existing UI to the new APIs.
4.  **Data Cleanup**: Remove dependency on mock data.

## Phase 1: API Implementation & Business Logic

### 1.1 Validation Schemas
- Define Zod schemas for `InboundReceipt` and `InboundReceiptItem` creation/updating.
- Ensure validation covers:
    - Required fields (partner, date, items).
    - Item validity (material existence, positive quantities).

### 1.2 API Routes
- **`GET /api/inbound`**: List receipts with pagination and filtering.
- **`POST /api/inbound`**: Create a new receipt.
    - Status: 'Yêu cầu nhập' (Draft/Requested).
- **`GET /api/inbound/[id]`**: Get details.
- **`PUT /api/inbound/[id]`**: Update receipt.
    - **CRITICAL**: If status changes to 'Hoàn thành' (Completed) or 'Đang nhập' (Receiving), trigger stock updates.
    - Logic for Stock Update (Transaction):
        1.  Verify sufficient permissions.
        2.  For each item:
            - Update `Material.stock` (+ receivedQuantity).
            - Update/Create `WarehouseItem` (based on `location` field).
            - Create `InventoryLog` (type: 'inbound').
        3.  Update `InboundReceipt` status.

### 1.3 Helper Functions
- Create `src/lib/actions/inventory.ts` (or similar) to encapsulate the stock movement logic so it can be reused (e.g., if we add a separate "Putaway" step later).

## Phase 2: Frontend Refactoring

### 2.1 Fetching Logic
- Replace `getInboundReceipts` in `src/app/inbound/page.tsx` with server-side fetch to API (or direct DB call if staying Server Component) or keep it as Client Component fetching.
- *Decision*: Since we are moving to a standard Next.js App Router API architecture, we will keep the Page as a Server Component that fetches initial data, but the Client Component will handle searching/filtering via API calls to avoid full page reloads, or standard router refresh.

### 2.2 Client Components
- Update `InboundClient` (`src/app/inbound/_components/inbound-client.tsx`):
    - Connect `handleAdd`, `handleEdit`, `handleDelete` to API endpoints.
    - Handle loading states and errors.
- Update `InboundForm` (`src/app/inbound/_components/inbound-form.tsx`):
    - Ensure form fields match the API expectation.
    - Handle "Complete" action specifically to warn user about stock update.

## Phase 3: Cleanup & Testing

### 3.1 Data Cleanup
- Remove `inboundReceipts` from `src/lib/data.ts`.
- Ensure no other mock references exist in the Inbound module.

### 3.2 Verification
- **Test Case 1**: Create Receipt -> Verify DB entry.
- **Test Case 2**: Update Receipt (Draft -> Draft) -> Verify changes, no stock change.
- **Test Case 3**: Complete Receipt -> Verify:
    - Receipt Status = 'Hoàn thành'.
    - Material Stock increased.
    - WarehouseItem created/increased.
    - InventoryLog created.

## Architecture & Files

### New Files
- `src/app/api/inbound/route.ts`
- `src/app/api/inbound/[id]/route.ts`
- `src/lib/validations/inbound.ts`

### Modified Files
- `src/app/inbound/page.tsx`
- `src/app/inbound/_components/inbound-client.tsx`
- `src/app/inbound/_components/inbound-form.tsx`
- `src/lib/data.ts` (cleanup)

## Questions/Risks
- **Location Management**: The UI currently might let users type arbitrary location strings. We should strictly link to `WarehouseLocation` IDs if possible, or assume the string is a valid code. *Assumption for now*: The UI sends a location string, backend will try to match it to a `WarehouseLocation.code` or ID. If not found, how to handle? -> *Decision*: For now, we will assume valid Location Code or ID is passed, or fail if strictly enforced. To keep it simple (KISS), we might just treat it as a string for `InboundReceiptItem`, but `WarehouseItem` needs a valid `locationId`. We will assume the dropdown in UI provides valid Location IDs.

