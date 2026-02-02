# Project Overview & Product Development Requirements (PDR)

**Project:** PowerTrack Logistics (O-M-Inventory)
**Date:** 2026-02-01
**Type:** Inventory Management System (O&M)

## 1. Project Vision

To provide a comprehensive, real-time inventory management solution for power plant operations and maintenance (O&M). The system aims to digitize the entire material lifecycle from request to disposal, ensuring accuracy, traceability, and operational efficiency.

## 2. Core Modules & Status

### 2.1 Materials Management (Live)
**Goal:** Centralized registry of all spare parts and consumables.
- CRUD operations with classification (Category, Unit, Management Type)
- Status tracking and Master Data management
- **Status:** Fully implemented with Database backing

### 2.2 Material Requests (Live)
**Goal:** Workflow for operational teams to request materials.
- Request creation with item picker and FK relations
- Multi-level approval workflow
- **Status:** Full CRUD with transactional updates

### 2.3 Warehouse Locations (Live)
**Goal:** Manage warehouse storage locations and zones.
- CRUD with FK relations (Area, Type, Status)
- Barcode/QR support, weight/dimension tracking
- **Status:** Full CRUD with Zod validation

### 2.4 Suppliers Management (Live)
**Goal:** Centralized registry of material suppliers and vendors.
- CRUD with FK relations and nested contacts management
- **Status:** Full CRUD with transactional updates

### 2.5 Purchase Requests (Live)
**Goal:** Workflow for purchasing materials not in stock.
- Request creation with items and estimated pricing
- Multi-level approval workflow
- **Status:** Full CRUD with transactional updates

### 2.6 Bidding Management (Live)
**Goal:** Manage procurement bidding packages from invitation to winner selection.
- CRUD with auto-generated codes (TB-YYYY-XX)
- Supplier participant invitation, quotation, scoring (60% tech, 40% price)
- 4-step workflow: Invite -> Receive -> Evaluate -> Done
- **Status:** Full CRUD with UI components complete

### 2.7 Inbound Logistics (Live)
**Goal:** Manage the receipt of goods into warehouses.
- Goods Receipt Notes (GRN) with PO matching
- FK relations (InboundType, Supplier, InboundStatus)
- KCS inspection support
- **Status:** Full CRUD at `/api/inbound`

### 2.8 Outbound Logistics (Live)
**Goal:** Control the issuance of materials to plant subsystems.
- Goods Issue Receipts (GIR) with approve/issue workflow
- Stock decrement on issue
- **Status:** Full CRUD at `/api/outbound`

### 2.9 Stocktake Management (Live)
**Goal:** Physical inventory counting and reconciliation.
- Stocktake creation with location assignments
- Counting results with variance tracking
- Workflow: Draft -> In Progress -> Reconciling -> Completed
- **Status:** Full CRUD at `/api/stocktake`

### 2.10 Reports & Analytics (Hybrid)
**Goal:** Operational insights and inventory valuation.
- Stock Level Reports, Movement History, Slow-moving analysis
- **Status:** UI exists with client-side calculation. Needs server-side aggregation.

### 2.11 Lifecycle Tracking (Live)
**Goal:** Track complete material lifecycle from request to installation.
- MaterialEvent logs for all lifecycle events (REQUEST, APPROVED, INBOUND, QC, OUTBOUND, INSTALLED)
- Installation tracking with location and slot information
- Timeline visualization per material
- **Status:** Full CRUD at `/api/materials/{id}/lifecycle` and `/api/installations`

## 3. Technical Requirements

### 3.1 Architecture
- **Frontend**: Next.js 15.5 (App Router)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL with Prisma 7
- **AI**: Firebase Genkit with Gemini 2.5 Flash

### 3.2 Performance Constraints
- **Page Load**: < 2 seconds for dashboard and list views
- **Search**: < 500ms for material lookup
- **Concurrent Users**: Support for 50+ simultaneous users

### 3.3 Security
- **Authentication**: Email-based login (basic)
- **Authorization**: Role-Based Access Control (RBAC)
- **Audit**: Full traceability via Activity Log

## 4. User Personas

| Persona | Role | Primary Goals |
|---------|------|---------------|
| **Plant Manager** | Admin/Viewer | View dashboards, approve high-value requests |
| **Warehouse Manager** | Manager | Oversee stock levels, manage team, approve discrepancies |
| **Storekeeper** | Staff | Execute Inbound/Outbound, physical counting |
| **Engineer** | User | Search parts, submit requests, track status |

## 5. Success Metrics
1. **Inventory Accuracy**: > 98% match between system and physical stock
2. **Request Cycle Time**: Reduce average time from Request to Issue by 30%
3. **Paper Reduction**: Eliminate 90% of paper-based logbooks
