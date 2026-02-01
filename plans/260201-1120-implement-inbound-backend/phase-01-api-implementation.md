# Phase 1: API Implementation & Business Logic

## Context
We need to implement the backend API for Inbound Receipts. This includes creating endpoints for listing, creating, updating, and deleting receipts. Crucially, we must implement the business logic that updates inventory levels when a receipt is finalized.

## Objectives
- Create Zod validation schemas.
- Implement GET/POST `/api/inbound`.
- Implement GET/PUT/DELETE `/api/inbound/[id]`.
- Implement Transactional Logic for Stock Updates on "Completion".

## Requirements
1.  **Validation**:
    - `InboundReceipt`: partner, inboundDate, type, reference.
    - `InboundReceiptItem`: materialId, orderedQuantity, receivingQuantity, location (optional but needed for stock).
2.  **Stock Update Trigger**:
    - When `status` changes to 'Hoàn thành' (Completed).
    - Or if we decide to do it incrementally, maybe 'Đang nhập'. Let's stick to 'Hoàn thành' for simplicity (KISS) as the trigger for "Official Stock Update" in this prototype, or 'Đang nhập' if partial.
    - *Decision*: To keep it robust, we will update stock when the status is set to 'Hoàn thành'.
3.  **Transaction**:
    - `prisma.$transaction`:
        - Update `InboundReceipt` status.
        - Loop items:
            - Update `Material` (stock += receivingQuantity).
            - Update `WarehouseItem` (find by materialId + locationId, or create).
            - Create `InventoryLog`.

## Files to Create
- `src/lib/validations/inbound.ts`
- `src/app/api/inbound/route.ts`
- `src/app/api/inbound/[id]/route.ts`

## Files to Modify
- `src/lib/types.ts` (Ensure compatibility if needed, though Prisma types are preferred).

## Implementation Steps
1.  **Define Validation Schemas**:
    - Create `src/lib/validations/inbound.ts` using `zod`.
2.  **List & Create API**:
    - `src/app/api/inbound/route.ts`
    - GET: Fetch `inboundReceipts` with `include: { items: true, documents: true }`. Support search/filter.
    - POST: Validate body, create `inboundReceipt` + `items`.
3.  **Detail & Update API**:
    - `src/app/api/inbound/[id]/route.ts`
    - GET: Fetch single receipt.
    - PUT:
        - If updating status to 'Hoàn thành':
            - Execute Transaction.
        - Else:
            - Just update fields/items.
    - DELETE: Allow delete only if not 'Hoàn thành' (or handle reversal - KISS: prevent delete if completed).

## Todo List
- [ ] Create `src/lib/validations/inbound.ts`
- [ ] Implement `GET /api/inbound`
- [ ] Implement `POST /api/inbound`
- [ ] Implement `GET /api/inbound/[id]`
- [ ] Implement `PUT /api/inbound/[id]` with Transaction Logic
- [ ] Implement `DELETE /api/inbound/[id]`
